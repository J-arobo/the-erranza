<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\Request;

class VendorListingController extends Controller
{
    public function index(Request $request)
    {
        $vendor = $request->attributes->get('vendor');

        $listings = $vendor->listings()
            ->with('images')
            ->withCount('bookings')
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
            'min_guests' => ['nullable', 'integer', 'min:1'],
            'max_guests' => ['nullable', 'integer', 'min:1'],
            'min_lead_time_days' => ['nullable', 'integer', 'min:0'],
            'cancellation_policy' => ['nullable', 'in:flexible,moderate,strict,custom'],
            'custom_cancellation_text' => ['nullable', 'string'],
            'amenities' => ['nullable', 'array'],
            'excluded' => ['nullable', 'array'],
        ]);

        $listing = $vendor->listings()->create([
            ...$validated,
            'status' => 'draft',
        ]);

        return response()->json(['listing' => $listing], 201);
    }

    public function show(Request $request, Listing $listing)
    {
        $this->authorizeOwnership($request, $listing);

        $listing->load([
            'images', 'itinerary', 'durationOptions', 'seasonalRates',
            'groupDiscounts', 'departures', 'blockedDates',
        ]);

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
        ]);

        $listing->update($validated);

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
