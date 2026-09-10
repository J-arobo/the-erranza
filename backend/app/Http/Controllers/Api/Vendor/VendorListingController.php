<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Services\VendorChangeNotifier;

class VendorListingController extends Controller
{
    private const HOUSE_RULE_KEYS = 'no_pets,no_parties,no_commercial_photography,smoking_allowed,quiet_hours,self_check_in';
    private const SAFETY_KEYS = 'no_carbon_monoxide_alarm,no_smoke_alarm,exterior_cameras,not_suitable_children,must_climb_stairs,no_parking,dangerous_animals,pets_on_property,noise_potential,amenity_limitations';

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
            'category' => ['required', 'string', 'max:100', Rule::in($vendor->categories ?? [])],
            'location' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'child_price' => ['nullable', 'numeric', 'min:0'],
            'extra_guest_price' => ['nullable', 'numeric', 'min:0'],
            'included_guests' => ['nullable', 'integer', 'min:1'],
            'status' => ['nullable', 'in:draft,active'],
            'min_guests' => ['nullable', 'integer', 'min:1'],
            'max_guests' => ['nullable', 'integer', 'min:1'],
            'min_nights' => ['nullable', 'integer', 'min:1'],
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
            'house_rules' => ['nullable', 'array'],
            'house_rules.selected' => ['nullable', 'array'],
            'house_rules.selected.*' => ['string', 'in:' . self::HOUSE_RULE_KEYS],
            'house_rules.additional_rules' => ['nullable', 'string'],
            'house_rules.additional_requests' => ['nullable', 'string'],
            'safety_info' => ['nullable', 'array'],
            'safety_info.*.key' => ['required', 'string', 'in:' . self::SAFETY_KEYS],
            'safety_info.*.note' => ['nullable', 'string'],

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
            // Group Pricing
            'group_pricing_tiers' => ['sometimes', 'array'],
            'group_pricing_tiers.*.people_count' => ['required', 'integer', 'min:1'],
            'group_pricing_tiers.*.total_price' => ['required', 'numeric', 'min:0'],
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

            'allow_custom_dates' => ['nullable', 'boolean'],
        ]);

        $listing = DB::transaction(function () use ($vendor, $validated) {
            $listing = $vendor->listings()->create([
                ...collect($validated)->only([
                    'title', 'category', 'location', 'description', 'price', 'child_price',
                    'extra_guest_price', 'included_guests', 'min_guests', 'max_guests', 'min_nights', 'min_lead_time_days',
                    'cancellation_policy', 'custom_cancellation_text', 'amenities', 'excluded',
                    'house_rules', 'safety_info', 'allow_custom_dates',
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
            // Group Discount
            foreach ($validated['group_pricing_tiers'] ?? [] as $tier) {
                $listing->groupPricingTiers()->create($tier);
            }


            return $listing;
        });

        $listing->load(['images', 'itinerary', 'durationOptions', 'groupDiscounts', 'groupPricingTiers', 'seasonalRates', 'departures', 'blockedDates', 'extras']);

        return response()->json(['listing' => $listing], 201);
    }


    public function show(Request $request, Listing $listing)
    {
        $this->authorizeOwnership($request, $listing);

        $listing->load([
            'images', 'itinerary', 'durationOptions', 'seasonalRates',
            'groupDiscounts', 'groupPricingTiers', 'departures', 'blockedDates', 'extras',
            'seasonalRates', 'departures', 'blockedDates', 'extras',
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
            'category' => ['sometimes', 'string', 'max:100', Rule::in(array_unique([...($listing->vendor->categories ?? []), $listing->category]))],
            'location' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'child_price' => ['nullable', 'numeric', 'min:0'],
            'extra_guest_price' => ['nullable', 'numeric', 'min:0'],
            'included_guests' => ['nullable', 'integer', 'min:1'],
            'status' => ['sometimes', 'in:draft,active,paused'],
            'min_guests' => ['nullable', 'integer', 'min:1'],
            'max_guests' => ['nullable', 'integer', 'min:1'],
            'min_nights' => ['nullable', 'integer', 'min:1'],
            'min_lead_time_days' => ['nullable', 'integer', 'min:0'],
            'cancellation_policy' => ['nullable', 'in:flexible,moderate,strict,custom'],
            'custom_cancellation_text' => ['nullable', 'string'],
            'amenities' => ['nullable', 'array'],
            'excluded' => ['nullable', 'array'],
            'house_rules' => ['nullable', 'array'],
            'house_rules.selected' => ['nullable', 'array'],
            'house_rules.selected.*' => ['string', 'in:' . self::HOUSE_RULE_KEYS],
            'house_rules.additional_rules' => ['nullable', 'string'],
            'house_rules.additional_requests' => ['nullable', 'string'],
            'safety_info' => ['nullable', 'array'],
            'safety_info.*.key' => ['required', 'string', 'in:' . self::SAFETY_KEYS],
            'safety_info.*.note' => ['nullable', 'string'],

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

            // Group Pricing
            'group_pricing_tiers' => ['sometimes', 'array'],
            'group_pricing_tiers.*.people_count' => ['required', 'integer', 'min:1'],
            'group_pricing_tiers.*.total_price' => ['required', 'numeric', 'min:0'],

            'seasonal_rates' => ['sometimes', 'array'],
            'seasonal_rates.*.label' => ['required', 'string', 'max:255'],
            'seasonal_rates.*.start_date' => ['required', 'date'],
            'seasonal_rates.*.end_date' => ['required', 'date'],
            'seasonal_rates.*.price' => ['required', 'numeric', 'min:0'],

            'departures' => ['sometimes', 'array'],
            'departures.*.date' => ['required', 'date'],
            'departures.*.capacity' => ['required', 'integer', 'min:1'],
            'departures.*.booked' => ['nullable', 'integer', 'min:0'],
            'departures.*.id' => ['nullable', 'integer', 'exists:listing_departures,id'],


            'blocked_dates' => ['sometimes', 'array'],
            'blocked_dates.*.start_date' => ['required', 'date'],
            'blocked_dates.*.end_date' => ['required', 'date'],
            'blocked_dates.*.reason' => ['nullable', 'string', 'max:100'],

            'extras' => ['sometimes', 'array'],
            'extras.*.label' => ['required', 'string', 'max:255'],
            'extras.*.price' => ['required', 'numeric', 'min:0'],
            'extras.*.default_selected' => ['nullable', 'boolean'],

            'allow_custom_dates' => ['nullable', 'boolean'],
        ]);

        DB::transaction(function () use ($listing, $validated) {
            $listing->update(collect($validated)->only([
                'title', 'category', 'location', 'description', 'price', 'child_price',
                'extra_guest_price', 'included_guests', 'status', 'min_guests', 'max_guests', 'min_nights', 'min_lead_time_days',
                'cancellation_policy', 'custom_cancellation_text', 'amenities', 'excluded',
                'house_rules', 'safety_info', 'allow_custom_dates',
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

            // Group Pricing
            if (array_key_exists('group_pricing_tiers', $validated)) {
                $listing->groupPricingTiers()->delete();
                foreach ($validated['group_pricing_tiers'] as $tier) {
                    $listing->groupPricingTiers()->create($tier);
                }
            }

            if (array_key_exists('seasonal_rates', $validated)) {
                $listing->seasonalRates()->delete();
                foreach ($validated['seasonal_rates'] ?? [] as $rate) {
                    $listing->seasonalRates()->create($rate);
                }
            }

            if (array_key_exists('departures', $validated)) {
                $existing = $listing->departures()->get()->keyBy('id');
                $keepIds = [];

                foreach ($validated['departures'] as $d) {
                    $current = !empty($d['id']) ? $existing->get($d['id']) : null;

                    if ($current) {
                        $keepIds[] = $current->id;
                        // A departure with existing bookings is immutable here — any
                        // date/capacity change from the client is ignored rather than
                        // risking orphaning a traveller's confirmed booking. The vendor
                        // is told this in the UI and pointed to support instead.
                        if ($current->booked > 0) continue;
                        $current->update(['date' => $d['date'], 'capacity' => $d['capacity']]);
                    } else {
                        $keepIds[] = $listing->departures()->create($d)->id;
                    }
                }

                // Only remove departures the vendor actually took out of the list,
                // and only if nobody has booked them.
                $listing->departures()->whereNotIn('id', $keepIds)->where('booked', 0)->delete();
            }

            if (array_key_exists('blocked_dates', $validated)) {
                $listing->blockedDates()->delete();
                foreach ($validated['blocked_dates'] ?? [] as $block) {
                    $listing->blockedDates()->create($block);
                }
            }

            if (array_key_exists('extras', $validated)) {
                $listing->extras()->delete();
                foreach ($validated['extras'] ?? [] as $extra) {
                    $listing->extras()->create($extra);
                }
            }
        });

        $listing->load([
            'images', 'itinerary', 'durationOptions', 'seasonalRates',
            'groupDiscounts', 'groupPricingTiers', 'departures', 'blockedDates', 'extras',
            'seasonalRates', 'departures', 'blockedDates', 'extras',
        ]);

        $fieldLabels = [
            'title' => 'Title', 'category' => 'Category', 'location' => 'Location',
            'description' => 'Description', 'price' => 'Base price', 'child_price' => 'Child price',
            'extra_guest_price' => 'Price per additional guest', 'included_guests' => 'Included guests',
            'status' => 'Status', 'min_guests' => 'Min guests', 'max_guests' => 'Max guests',
            'min_nights' => 'Minimum nights', 'min_lead_time_days' => 'Minimum lead time',
            'cancellation_policy' => 'Cancellation policy', 'custom_cancellation_text' => 'Custom cancellation text',
            'amenities' => "What's included", 'excluded' => 'Excluded items',
            'house_rules' => 'House/tour rules', 'safety_info' => 'Safety info',
            'allow_custom_dates' => 'Allow custom dates',
            'bedrooms' => 'Bedrooms', 'beds' => 'Beds', 'bathrooms' => 'Bathrooms',
            'lat' => 'Map location', 'lng' => 'Map location',
        ];
        $relatedLabels = [
            'images' => 'Photos', 'itinerary' => 'Itinerary', 'duration_options' => 'Duration options',
            'group_discounts' => 'Group discounts', 'group_pricing_tiers' => 'Group pricing',
            'seasonal_rates' => 'Seasonal rates', 'departures' => 'Departures', 'blocked_dates' => 'Blocked dates',
            'extras' => 'Extras & add-ons',
        ];

        $changes = collect($listing->getChanges())->keys()
            ->reject(fn ($k) => $k === 'updated_at')
            ->map(fn ($k) => $fieldLabels[$k] ?? \Illuminate\Support\Str::headline($k));

        foreach ($relatedLabels as $key => $label) {
            if (array_key_exists($key, $validated)) {
                $changes->push($label);
            }
        }

        $changes = $changes->unique()->values()->all();
        if (!empty($changes)) {
            VendorChangeNotifier::notify($listing->vendor, "Your listing \"{$listing->title}\" was updated", $changes);
        }

        return response()->json(['listing' => $listing]);

    }

    public function destroy(Request $request, Listing $listing)
    {
        $this->authorizeOwnership($request, $listing);

        $hasActiveBookings = $listing->bookings()->whereNotIn('status', ['completed', 'cancelled'])->exists();
        abort_if($hasActiveBookings, 422, "This listing has a booking that hasn't been completed yet, so it can't be deleted. Please contact customer support if you need help with this.");

        $listing->delete();

        return response()->json(['message' => 'Listing deleted.']);
    }

    private function authorizeOwnership(Request $request, Listing $listing): void
    {
        $vendor = $request->attributes->get('vendor');

        abort_unless($listing->vendor_id === $vendor->id, 403);
    }
}
