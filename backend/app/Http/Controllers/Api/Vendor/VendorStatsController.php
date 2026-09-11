<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Message;
use Illuminate\Http\Request;

class VendorStatsController extends Controller
{
    public function index(Request $request)
    {
        $vendor = $request->attributes->get('vendor');

        $bookingIds = Booking::whereHas('listing', fn ($q) => $q->where('vendor_id', $vendor->id))->pluck('id');

        $threads = Message::whereIn('booking_id', $bookingIds)
            ->orderBy('created_at')
            ->get()
            ->groupBy('booking_id');

        $answered = 0;
        $responseTimes = [];

        foreach ($threads as $messages) {
            $firstGuest = $messages->firstWhere('sender_type', 'guest');
            $firstReply = $firstGuest
                ? $messages->first(fn ($m) => $m->sender_type === 'vendor' && $m->created_at->gt($firstGuest->created_at))
                : null;

            if ($firstGuest && $firstReply) {
                $answered++;
                $responseTimes[] = $firstGuest->created_at->diffInMinutes($firstReply->created_at);
            }
        }

        $totalThreads = $threads->count();

        $listings = $vendor->listings()
            ->where('status', 'active')
            ->withCount('bookings')
            ->withAvg(['reviews' => fn ($q) => $q->where('removed', false)], 'rating')
            ->get()
            ->map(function ($listing) {
                $rating = $listing->reviews_avg_rating ? (float) $listing->reviews_avg_rating : 0;
                $conversion = $listing->views ? ($listing->bookings_count / $listing->views) * 100 : 0;
                $score = $rating * 10 + $conversion * 2;

                $percentile = match (true) {
                    $score >= 55 => 5,
                    $score >= 45 => 15,
                    $score >= 35 => 30,
                    $score >= 25 => 50,
                    default => 70,
                };

                return [
                    'id' => $listing->id,
                    'title' => $listing->title,
                    'percentile' => $percentile,
                    'label' => "Est. top {$percentile}% for {$listing->category} listings",
                ];
            });

        return response()->json([
            'total_threads' => $totalThreads,
            'answered_threads' => $answered,
            'response_rate' => $totalThreads > 0 ? round(($answered / $totalThreads) * 100) : 0,
            'avg_response_minutes' => count($responseTimes) > 0 ? array_sum($responseTimes) / count($responseTimes) : null,
            'listings' => $listings,
        ]);
    }

    // Money figures come straight from the payout ledger — what Erranza has
    // disbursed (or, for bank transfers, will disburse) — not a recalculation
    // of booking totals. Paid-out extra charges are included automatically.
    public function earnings(Request $request)
    {
        $vendor = $request->attributes->get('vendor');
        $commissionRate = $vendor->plan === 'plus' ? 0.08 : 0.12;

        $legs = \App\Models\BookingPayout::where('vendor_id', $vendor->id)
            ->where('leg', 'vendor')
            ->get(['amount', 'status', 'paid_at', 'created_at']);

        $earnedLegs = $legs->whereIn('status', ['paid', 'manual']);

        $monthly = collect(range(11, 0))->map(function ($monthsAgo) use ($earnedLegs) {
            $date = now()->subMonths($monthsAgo);
            $amount = $earnedLegs->filter(function ($l) use ($date) {
                $when = $l->paid_at ?? $l->created_at;
                return $when && $when->isSameMonth($date) && $when->isSameYear($date);
            })->sum('amount');

            return [
                'month' => $date->format('M'),
                'full_month' => $date->format('F'),
                'year' => $date->format('Y'),
                'amount' => round($amount),
            ];
        })->values();

        $completedTrips = Booking::whereHas('listing', fn ($q) => $q->where('vendor_id', $vendor->id))
            ->where('status', 'completed')
            ->count();

        $listings = $vendor->listings()
            ->with('images')
            ->withCount('bookings')
            ->get()
            ->map(fn ($l) => [
                'id' => $l->id,
                'title' => $l->title,
                'views' => $l->views,
                'bookings' => $l->bookings_count,
                'image' => $l->images->first()?->url,
            ]);

        return response()->json([
            'monthly' => $monthly,
            'total_earned' => round($earnedLegs->sum('amount')),
            'this_month' => $monthly->last()['amount'] ?? 0,
            'in_transit' => round($legs->whereIn('status', ['pending', 'processing'])->sum('amount')),
            'needs_attention' => round($legs->where('status', 'failed')->sum('amount')),
            'completed_trips' => $completedTrips,
            'total_views' => $listings->sum('views'),
            'commission_rate' => $commissionRate,
            'listings' => $listings,
        ]);
    }
}
