<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Listing;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $bookings = $request->user()->bookings()
            ->with(['listing.images', 'listing.vendor:id,business_name'])
            ->latest()
            ->get();

        return response()->json(['bookings' => $bookings]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'listing_id' => ['required', 'exists:listings,id'],
            'guests' => ['required', 'integer', 'min:1'],
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['nullable', 'date', 'after:check_in'],
            'special_requests' => ['nullable', 'string'],
        ]);

        $listing = Listing::findOrFail($validated['listing_id']);

        abort_unless($listing->status === 'active', 422, 'This listing is not currently bookable.');

        if ($listing->min_guests && $validated['guests'] < $listing->min_guests) {
            throw ValidationException::withMessages([
                'guests' => ["Minimum {$listing->min_guests} guests required."],
            ]);
        }

        if ($listing->max_guests && $validated['guests'] > $listing->max_guests) {
            throw ValidationException::withMessages([
                'guests' => ["Maximum {$listing->max_guests} guests allowed."],
            ]);
        }

        if ($listing->min_lead_time_days) {
            $earliest = now()->addDays($listing->min_lead_time_days)->startOfDay();
            $checkIn = Carbon::parse($validated['check_in'])->startOfDay();

            if ($checkIn->lt($earliest)) {
                throw ValidationException::withMessages([
                    'check_in' => ["This listing requires at least {$listing->min_lead_time_days} days' notice."],
                ]);
            }
        }

        // Simplified pricing: base price × guests. Duration options, seasonal
        // rates and group discounts aren't factored in server-side yet.
        $total = $listing->price * $validated['guests'];

        $booking = $request->user()->bookings()->create([
            'listing_id' => $listing->id,
            'status' => 'pending',
            'guests' => $validated['guests'],
            'total' => $total,
            'check_in' => $validated['check_in'],
            'check_out' => $validated['check_out'] ?? null,
            'special_requests' => $validated['special_requests'] ?? null,
        ]);

        $listing->vendor->notifications()->create([
            'type' => 'booking',
            'title' => 'New booking request',
            'message' => "{$request->user()->name} requested to book \"{$listing->title}\".",
            'link' => "/vendor/bookings/{$booking->id}",
        ]);

        return response()->json(['booking' => $booking], 201);
    }

    public function show(Request $request, Booking $booking)
    {
        $this->authorizeOwnership($request, $booking);

        $booking->load(['listing.images', 'listing.vendor:id,business_name,phone', 'messages.sender:id,name', 'review']);

        return response()->json(['booking' => $booking]);
    }

    public function cancel(Request $request, Booking $booking)
    {
        $this->authorizeOwnership($request, $booking);

        abort_unless(
            in_array($booking->status, ['pending', 'confirmed', 'alternative_proposed']),
            422,
            'This booking can no longer be cancelled.'
        );

        $booking->update(['status' => 'cancelled']);

        return response()->json(['booking' => $booking]);
    }

    private function authorizeOwnership(Request $request, Booking $booking): void
    {
        abort_unless($booking->traveller_id === $request->user()->id, 403);
    }
}
