<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VendorListingController extends Controller
{
    public function index(Request $request)
    {
        $vendor = $request->attributes->get('vendor');

        $listings = $vendor->listings()
            ->with('images')
            ->withCount('bookings')
            ->withCount(['reviews' => fn ($q) => $q->where('removed', false)])
            ->withAvg(['reviews' => fn ($q) => $q->where('removed', false)], 'rating')
            ->withSum(['bookings as earnings' => fn ($q) => $q->where('status', 'completed')], 'total')
            ->latest()
            ->get();

        return response()->json(['listings' => $listings]);
    }

    public function store(Request $request)
    {
        $vendor = $request->attributes->get('vendor');

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'location' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'child_price' => ['nullable', 'numeric', 'min:0'],
            'extra_guest_price' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:draft,active'],
            'min_guests' => ['nullable', 'integer', 'min:1'],
            'max_guests' => ['nullable', 'integer', 'min:1'],
            // Room details
            'bedrooms' => ['nullable', 'integer', 'min:0'],
            'beds' => ['nullable', 'integer', 'min:0'],
            'bathrooms' => ['nullable', 'integer', 'min:0'],
            'lat' => ['nullable', 'numeric', 'between:-90,90'],
            'lng' => ['nullable', 'numeric', 'between:-180,180'],

            'min_lead_time_days' => ['nullable', 'integer', 'min:0'],
            'cancellation_policy' => ['nullable', 'in:flexible,moderate,strict,custom'],
            'custom_cancellation_text' => ['nullable', 'string'],
            'amenities' => ['nullable', 'array'],
            'excluded' => ['nullable', 'array'],

            'images' => ['sometimes', 'array'],
            'images.*.url' => ['required', 'string'],

            'itinerary' => ['sometimes', 'array'],
            'itinerary.*.day' => ['required', 'integer', 'min:1'],
            'itinerary.*.title' => ['required', 'string', 'max:255'],
            'itinerary.*.description' => ['nullable', 'string'],

            'duration_options' => ['sometimes', 'array'],
            'duration_options.*.label' => ['required', 'string', 'max:255'],
            'duration_options.*.price' => ['nullable', 'numeric', 'min:0'],

            'group_discounts' => ['sometimes', 'array'],
            'group_discounts.*.min_guests' => ['required', 'integer', 'min:1'],
            'group_discounts.*.discount_percent' => ['required', 'integer', 'min:0', 'max:100'],
        ]);

        $listing = DB::transaction(function () use ($vendor, $validated) {
            $listing = $vendor->listings()->create([
                ...collect($validated)->only([
                    'title', 'category', 'location', 'description', 'price', 'child_price',
                    'extra_guest_price', 'min_guests', 'max_guests', 'min_lead_time_days',
                    'cancellation_policy', 'custom_cancellation_text', 'amenities', 'excluded',
                    //Room details
                    'bedrooms', 'beds', 'bathrooms', 'lat', 'lng',
                ])->toArray(),
                'status' => $validated['status'] ?? 'draft',
            ]);

            foreach ($validated['images'] ?? [] as $i => $img) {
                $listing->images()->create(['url' => $img['url'], 'position' => $i]);
            }
            foreach ($validated['itinerary'] ?? [] as $day) {
                $listing->itinerary()->create($day);
            }
            foreach ($validated['duration_options'] ?? [] as $option) {
                $listing->durationOptions()->create($option);
            }
            foreach ($validated['group_discounts'] ?? [] as $discount) {
                $listing->groupDiscounts()->create($discount);
            }

            return $listing;
        });

        $listing->load(['images', 'itinerary', 'durationOptions', 'groupDiscounts']);

        return response()->json(['listing' => $listing], 201);
    }


    public function show(Request $request, Listing $listing)
    {
        $this->authorizeOwnership($request, $listing);

        $listing->load([
            'images', 'itinerary', 'durationOptions', 'seasonalRates',
            'groupDiscounts', 'departures', 'blockedDates', 'extras',
        ]);
        $listing->loadCount('bookings');
        $listing->loadSum(['bookings as earnings' => fn ($q) => $q->where('status', 'completed')], 'total');

        return response()->json(['listing' => $listing]);
    }

    public function update(Request $request, Listing $listing)
    {
        $this->authorizeOwnership($request, $listing);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'string', 'max:100'],
            'location' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'child_price' => ['nullable', 'numeric', 'min:0'],
            'extra_guest_price' => ['nullable', 'numeric', 'min:0'],
            'status' => ['sometimes', 'in:draft,active,paused'],
            'min_guests' => ['nullable', 'integer', 'min:1'],
            'max_guests' => ['nullable', 'integer', 'min:1'],
            'min_lead_time_days' => ['nullable', 'integer', 'min:0'],
            'cancellation_policy' => ['nullable', 'in:flexible,moderate,strict,custom'],
            'custom_cancellation_text' => ['nullable', 'string'],
            'amenities' => ['nullable', 'array'],
            'excluded' => ['nullable', 'array'],

            'images' => ['sometimes', 'array'],
            'images.*.url' => ['required', 'string'],

            //Room details
            'bedrooms' => ['nullable', 'integer', 'min:0'],
            'beds' => ['nullable', 'integer', 'min:0'],
            'bathrooms' => ['nullable', 'integer', 'min:0'],
            'lat' => ['nullable', 'numeric', 'between:-90,90'],
            'lng' => ['nullable', 'numeric', 'between:-180,180'],

            'itinerary' => ['sometimes', 'array'],
            'itinerary.*.day' => ['required', 'integer', 'min:1'],
            'itinerary.*.title' => ['required', 'string', 'max:255'],
            'itinerary.*.description' => ['nullable', 'string'],

            'duration_options' => ['sometimes', 'array'],
            'duration_options.*.label' => ['required', 'string', 'max:255'],
            'duration_options.*.price' => ['nullable', 'numeric', 'min:0'],

            'group_discounts' => ['sometimes', 'array'],
            'group_discounts.*.min_guests' => ['required', 'integer', 'min:1'],
            'group_discounts.*.discount_percent' => ['required', 'integer', 'min:0', 'max:100'],

            'seasonal_rates' => ['sometimes', 'array'],
            'seasonal_rates.*.label' => ['required', 'string', 'max:255'],
            'seasonal_rates.*.start_date' => ['required', 'date'],
            'seasonal_rates.*.end_date' => ['required', 'date'],
            'seasonal_rates.*.price' => ['required', 'numeric', 'min:0'],

            'departures' => ['sometimes', 'array'],
            'departures.*.date' => ['required', 'date'],
            'departures.*.capacity' => ['required', 'integer', 'min:1'],
            'departures.*.booked' => ['nullable', 'integer', 'min:0'],

            'blocked_dates' => ['sometimes', 'array'],
            'blocked_dates.*.start_date' => ['required', 'date'],
            'blocked_dates.*.end_date' => ['required', 'date'],
            'blocked_dates.*.reason' => ['nullable', 'string', 'max:100'],

            'extras' => ['sometimes', 'array'],
            'extras.*.label' => ['required', 'string', 'max:255'],
            'extras.*.price' => ['required', 'numeric', 'min:0'],
            'extras.*.default_selected' => ['nullable', 'boolean'],
        ]);

        DB::transaction(function () use ($listing, $validated) {
            $listing->update(collect($validated)->only([
                'title', 'category', 'location', 'description', 'price', 'child_price',
                'extra_guest_price', 'status', 'min_guests', 'max_guests', 'min_lead_time_days',
                'cancellation_policy', 'custom_cancellation_text', 'amenities', 'excluded',
                // Room details
                'bedrooms', 'beds', 'bathrooms', 'lat', 'lng',
            ])->toArray());

            if (array_key_exists('images', $validated)) {
                $listing->images()->delete();
                foreach ($validated['images'] as $i => $img) {
                    $listing->images()->create(['url' => $img['url'], 'position' => $i]);
                }
            }

            if (array_key_exists('itinerary', $validated)) {
                $listing->itinerary()->delete();
                foreach ($validated['itinerary'] as $day) {
                    $listing->itinerary()->create($day);
                }
            }

            if (array_key_exists('duration_options', $validated)) {
                $listing->durationOptions()->delete();
                foreach ($validated['duration_options'] as $option) {
                    $listing->durationOptions()->create($option);
                }
            }

            if (array_key_exists('group_discounts', $validated)) {
                $listing->groupDiscounts()->delete();
                foreach ($validated['group_discounts'] as $discount) {
                    $listing->groupDiscounts()->create($discount);
                }
            }

            if (array_key_exists('seasonal_rates', $validated)) {
                $listing->seasonalRates()->delete();
                foreach ($validated['seasonal_rates'] as $rate) {
                    $listing->seasonalRates()->create($rate);
                }
            }

            if (array_key_exists('departures', $validated)) {
                $listing->departures()->delete();
                foreach ($validated['departures'] as $departure) {
                    $listing->departures()->create($departure);
                }
            }

            if (array_key_exists('blocked_dates', $validated)) {
                $listing->blockedDates()->delete();
                foreach ($validated['blocked_dates'] as $block) {
                    $listing->blockedDates()->create($block);
                }
            }

            if (array_key_exists('extras', $validated)) {
                $listing->extras()->delete();
                foreach ($validated['extras'] as $extra) {
                    $listing->extras()->create($extra);
                }
            }
        });

        $listing->load([
            'images', 'itinerary', 'durationOptions', 'seasonalRates',
            'groupDiscounts', 'departures', 'blockedDates', 'extras',
        ]);

        return response()->json(['listing' => $listing]);
    }

    public function destroy(Request $request, Listing $listing)
    {
        $this->authorizeOwnership($request, $listing);

        $listing->delete();

        return response()->json(['message' => 'Listing deleted.']);
    }

    private function authorizeOwnership(Request $request, Listing $listing): void
    {
        $vendor = $request->attributes->get('vendor');

        abort_unless($listing->vendor_id === $vendor->id, 403);
    }
}
