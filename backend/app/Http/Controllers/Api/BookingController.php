<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Listing;
use App\Models\ListingDeparture;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            'check_in' => ['nullable', 'date', 'after_or_equal:today'],
            'check_out' => ['nullable', 'date', 'after:check_in'],
            'departure_id' => ['nullable', 'exists:listing_departures,id'],
            'special_requests' => ['nullable', 'string'],
        ]);

        $listing = Listing::findOrFail($validated['listing_id']);

        abort_unless($listing->status === 'active', 422, 'This listing is not currently bookable.');

        $hasDepartures = $listing->departures()->exists();
        $departure = null;

        if ($hasDepartures) {
            if (empty($validated['departure_id'])) {
                throw ValidationException::withMessages([
                    'departure_id' => ['Please select a departure date.'],
                ]);
            }

            $departure = ListingDeparture::where('id', $validated['departure_id'])
                ->where('listing_id', $listing->id)
                ->first();

            abort_unless($departure, 422, 'Invalid departure selected.');
        } elseif (empty($validated['check_in'])) {
            throw ValidationException::withMessages([
                'check_in' => ['Please select a date.'],
            ]);
        }

        $effectiveCheckIn = $departure?->date->toDateString() ?? $validated['check_in'];

        if ($listing->category === 'Stays' && !empty($validated['check_out'])) {
            $checkIn = Carbon::parse($effectiveCheckIn);
            $checkOut = Carbon::parse($validated['check_out']);

            $overlapping = $listing->bookings()
                ->whereIn('status', ['pending', 'confirmed', 'alternative_proposed'])
                ->whereNotNull('check_out')
                ->where('check_in', '<', $checkOut)
                ->where('check_out', '>', $checkIn)
                ->exists();

            if ($overlapping) {
                throw ValidationException::withMessages([
                    'check_in' => ['These dates are no longer available for this listing.'],
                ]);
            }
        }

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
            $checkInDate = Carbon::parse($effectiveCheckIn)->startOfDay();

            if ($checkInDate->lt($earliest)) {
                throw ValidationException::withMessages([
                    'check_in' => ["This listing requires at least {$listing->min_lead_time_days} days' notice."],
                ]);
            }
        }

        // Simplified pricing: base price × guests × nights (when a check-out
        // date is given). Duration options, seasonal rates and group
        // discounts still aren't factored in server-side.
        $nights = $validated['check_out'] ?? null
            ? max(1, Carbon::parse($validated['check_out'])->diffInDays(Carbon::parse($effectiveCheckIn)))
            : 1;

        $total = $listing->price * $validated['guests'] * $nights;

        $booking = DB::transaction(function () use ($request, $listing, $departure, $effectiveCheckIn, $validated, $total) {
            if ($departure) {
                $locked = ListingDeparture::where('id', $departure->id)->lockForUpdate()->first();

                if ($locked->booked >= $locked->capacity) {
                    throw ValidationException::withMessages([
                        'departure_id' => ['This departure just sold out. Please pick another date.'],
                    ]);
                }

                $locked->increment('booked');
            }

            return $request->user()->bookings()->create([
                'listing_id' => $listing->id,
                'departure_id' => $departure?->id,
                'status' => 'pending',
                'guests' => $validated['guests'],
                'total' => $total,
                'check_in' => $effectiveCheckIn,
                'check_out' => $validated['check_out'] ?? null,
                'special_requests' => $validated['special_requests'] ?? null,
            ]);
        });

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

        $booking->load(['listing.images', 'listing.itinerary', 'listing.vendor:id,business_name,phone', 'messages.sender:id,name', 'review']);

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

        if ($booking->departure_id) {
            ListingDeparture::where('id', $booking->departure_id)->decrement('booked');
        }

        $booking->update(['status' => 'cancelled']);

        return response()->json(['booking' => $booking]);
    }

    private function authorizeOwnership(Request $request, Booking $booking): void
    {
        abort_unless($booking->traveller_id === $request->user()->id, 403);
    }
}
