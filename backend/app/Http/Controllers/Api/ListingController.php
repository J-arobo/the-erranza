<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Listing;
use App\Models\Message;
use Illuminate\Http\Request;

class ListingController extends Controller
{
    public function index(Request $request)
    {
        $query = Listing::query()
            ->where('status', 'active')
            ->whereHas('vendor', fn($q) => $q->where('suspended', false));

        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }

        if ($request->filled('location')) {
            $query->where('location', 'like', '%' . $request->string('location') . '%');
        }

        if ($request->filled('q')) {
            $search = $request->string('q');
            $query->where(fn($q) => $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%"));
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->float('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->float('max_price'));
        }

        $perPage = min((int) $request->input('per_page', 12), 100);

        $listings = $query->with(['images', 'itinerary', 'vendor:id,business_name,verification_status'])
            ->withCount(['reviews' => fn($q) => $q->where('removed', false)])
            ->withAvg(['reviews' => fn($q) => $q->where('removed', false)], 'rating')
            ->paginate($perPage);


        return response()->json($listings);
    }

    public function show(Listing $listing)
    {
        abort_unless($listing->status === 'active', 404);

        $listing->load([
            'images',
            'itinerary',
            'durationOptions',
            'seasonalRates',
            'groupDiscounts',
            'departures',
            'blockedDates',
            'vendor:id,business_name,bio,logo_url,languages,verification_status,created_at',
            'vendor.teamMembers',
            'reviews' => fn($q) => $q->where('removed', false)->with('traveller:id,name')->latest(),
        ]);

        $listing->loadCount(['reviews' => fn($q) => $q->where('removed', false)]);
        $listing->loadAvg(['reviews' => fn($q) => $q->where('removed', false)], 'rating');

        $vendor = $listing->vendor;
        $rating = $listing->reviews_avg_rating ? (float) $listing->reviews_avg_rating : 0;
        $reviewCount = $listing->reviews_count;

        $listing->is_superhost = $vendor->verification_status === 'approved' && $rating >= 4.8 && $reviewCount >= 5;
        $listing->years_hosting = (int) floor($vendor->created_at->diffInYears(now()));
        $listing->cohost = $vendor->teamMembers->firstWhere('status', 'active');

        $bookingIds = Booking::whereHas('listing', fn($q) => $q->where('vendor_id', $vendor->id))->pluck('id');
        $threads = Message::whereIn('booking_id', $bookingIds)->orderBy('created_at')->get()->groupBy('booking_id');

        $answered = 0;
        $responseTimes = [];
        foreach ($threads as $messages) {
            $firstGuest = $messages->firstWhere('sender_type', 'guest');
            $firstReply = $firstGuest
                ? $messages->first(fn($m) => $m->sender_type === 'vendor' && $m->created_at->gt($firstGuest->created_at))
                : null;
            if ($firstGuest && $firstReply) {
                $answered++;
                $responseTimes[] = $firstGuest->created_at->diffInMinutes($firstReply->created_at);
            }
        }

        $listing->response_rate = $threads->count() > 0 ? round(($answered / $threads->count()) * 100) : null;
        $listing->avg_response_minutes = count($responseTimes) > 0 ? array_sum($responseTimes) / count($responseTimes) : null;

        return response()->json(['listing' => $listing]);
    }
}
