<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Listing;
use App\Models\Message;
use Illuminate\Http\Request;
use App\Models\ListingDeparture;
use App\Services\ListingPricingService;
use Carbon\Carbon;

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
        if ($request->filled('guests')) {
            $guests = (int) $request->input('guests');
            $query->where(fn($q) => $q->whereNull('max_guests')->orWhere('max_guests', '>=', $guests))
                ->where(fn($q) => $q->whereNull('min_guests')->orWhere('min_guests', '<=', $guests));
        }

        if ($request->boolean('deals')) {
            $today = now()->toDateString();
            $query->whereHas('seasonalRates', function ($q) use ($today) {
                $q->where('start_date', '<=', $today)
                    ->where('end_date', '>=', $today)
                    ->whereColumn('listing_seasonal_rates.price', '<', 'listings.price');
            });
        }

        $perPage = min((int) $request->input('per_page', 12), 100);

        $listings = $query->with(['images', 'itinerary', 'vendor:id,business_name,verification_status', 'seasonalRates'])
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
            'groupPricingTiers',
            'departures',
            'blockedDates',
            'vendor:id,business_name,bio,logo_url,languages,verification_status,created_at',
            'vendor.teamMembers',
            'reviews' => fn($q) => $q->where('removed', false)->with('traveller:id,name,avatar_url')->latest(),
        ]);

        $listing->loadCount(['reviews' => fn($q) => $q->where('removed', false)]);
        $listing->loadAvg(['reviews' => fn($q) => $q->where('removed', false)], 'rating');

        $vendor = $listing->vendor;
        $rating = $listing->reviews_avg_rating ? (float) $listing->reviews_avg_rating : 0;
        $reviewCount = $listing->reviews_count;

        $listing->is_superhost = $vendor->verification_status === 'approved' && $rating >= 4.8 && $reviewCount >= 5;
        $listing->years_hosting = (int) floor($vendor->created_at->diffInYears(now()));
        $listing->cohost = $vendor->teamMembers->firstWhere('status', 'active');

        // Unavailable dates
        $unavailableDates = $listing->bookings()
            ->whereIn('status', ['pending', 'confirmed', 'alternative_proposed'])
            ->whereNotNull('check_out')
            ->get(['check_in', 'check_out'])
            ->map(fn($b) => ['start' => $b->check_in->toDateString(), 'end' => $b->check_out->toDateString()])
            ->concat($listing->blockedDates->map(fn($b) => [
                'start' => $b->start_date->toDateString(),
                'end' => $b->end_date->toDateString(),
            ]))
            ->values();

        $listing->unavailable_dates = $unavailableDates;

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

        // This method calculates a price quote for a listing based on the provided parameters.
        public function quote(Request $request, Listing $listing)
        {
            $validated = $request->validate([
                'guests' => ['required', 'integer', 'min:1'],
                'check_in' => ['nullable', 'date'],
                'check_out' => ['nullable', 'date'],
                'departure_id' => ['nullable', 'exists:listing_departures,id'],
                'duration_option_id' => ['nullable', 'exists:listing_duration_options,id'],
                'pricing_mode' => ['nullable', 'in:individual,group'],
                'group_tier_id' => ['nullable', 'exists:listing_group_pricing_tiers,id'],
            ]);
    
            $checkIn = $validated['check_in'] ?? null;
            if (!empty($validated['departure_id'])) {
                $departure = ListingDeparture::where('id', $validated['departure_id'])
                    ->where('listing_id', $listing->id)->first();
                $checkIn = $departure?->date->toDateString() ?? $checkIn;
            }
    
            $nights = !empty($validated['check_out']) && $checkIn
                ? max(1, Carbon::parse($validated['check_out'])->diffInDays(Carbon::parse($checkIn)))
                : 1;
    
            $pricing = ListingPricingService::calculate($listing, [
                'guests' => $validated['guests'],
                'nights' => $nights,
                'check_in' => $checkIn,
                'duration_option_id' => $validated['duration_option_id'] ?? null,
                'pricing_mode' => $validated['pricing_mode'] ?? 'individual',
                'group_tier_id' => $validated['group_tier_id'] ?? null,
            ]);
    
            return response()->json($pricing);
        }
}
