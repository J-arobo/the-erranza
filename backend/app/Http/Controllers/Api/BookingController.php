<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\Listing;
use App\Models\ListingDeparture;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
//For Paystack integration
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

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
            'payment_plan' => ['nullable', 'in:full,instalments'],
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
        $paymentPlan = $validated['payment_plan'] ?? 'full';

        $booking = DB::transaction(function () use ($request, $listing, $departure, $effectiveCheckIn, $validated, $total, $paymentPlan) {
            if ($departure) {
                $locked = ListingDeparture::where('id', $departure->id)->lockForUpdate()->first();

                if ($locked->booked >= $locked->capacity) {
                    throw ValidationException::withMessages([
                        'departure_id' => ['This departure just sold out. Please pick another date.'],
                    ]);
                }

                $locked->increment('booked');
            }

            $booking = $request->user()->bookings()->create([
                'listing_id' => $listing->id,
                'departure_id' => $departure?->id,
                'status' => 'pending',
                'guests' => $validated['guests'],
                'total' => $total,
                'payment_plan' => $paymentPlan,
                'check_in' => $effectiveCheckIn,
                'check_out' => $validated['check_out'] ?? null,
                'special_requests' => $validated['special_requests'] ?? null,
            ]);

            if ($paymentPlan === 'instalments') {
                $installmentAmount = round($total / 3, 2);
                $lastAmount = round($total - ($installmentAmount * 2), 2);

                $booking->payments()->create([
                    'amount' => $installmentAmount,
                    'due_date' => now()->toDateString(),
                    'status' => 'pending',
                ]);
                $booking->payments()->create([
                    'amount' => $installmentAmount,
                    'due_date' => now()->addDays(30)->toDateString(),
                    'status' => 'pending',
                ]);
                $booking->payments()->create([
                    'amount' => $lastAmount,
                    'due_date' => now()->addDays(60)->toDateString(),
                    'status' => 'pending',
                ]);
            } else {
                $booking->payments()->create([
                    'amount' => $total,
                    'due_date' => now()->toDateString(),
                    'status' => 'pending',
                ]);
            }

            return $booking;
        });

        $listing->vendor->notifications()->create([
            'type' => 'booking',
            'title' => 'New booking request',
            'message' => "{$request->user()->name} requested to book \"{$listing->title}\".",
            'link' => "/vendor/bookings/{$booking->id}",
        ]);

        $booking->load('payments');

        return response()->json(['booking' => $booking], 201);
    }
    
    // Dates to be reserved only after booking is confirmed. This endpoint is for initializing the payment process and returning the necessary data to the frontend.
    public function initializeBookingPayment(Request $request)
    {
        $validated = $request->validate([
            'listing_id' => ['required', 'exists:listings,id'],
            'guests' => ['required', 'integer', 'min:1'],
            'check_in' => ['nullable', 'date'],
            'check_out' => ['nullable', 'date'],
            'departure_id' => ['nullable', 'exists:listing_departures,id'],
        ]);

        $listing = Listing::findOrFail($validated['listing_id']);
        $departure = !empty($validated['departure_id'])
            ? ListingDeparture::where('id', $validated['departure_id'])->where('listing_id', $listing->id)->first()
            : null;
        $effectiveCheckIn = $departure?->date->toDateString() ?? $validated['check_in'] ?? null;

        $nights = !empty($validated['check_out']) && $effectiveCheckIn
            ? max(1, Carbon::parse($validated['check_out'])->diffInDays(Carbon::parse($effectiveCheckIn)))
            : 1;

        $total = $listing->price * $validated['guests'] * $nights;
        $reference = 'booking_' . Str::random(16);

        return response()->json([
            'reference' => $reference,
            'amount' => (int) round($total * 100),
            'email' => $request->user()->email,
        ]);
    }

    public function verifyAndCreate(Request $request)
    {
        $validated = $request->validate([
            'reference' => ['required', 'string'],
            'listing_id' => ['required', 'exists:listings,id'],
            'guests' => ['required', 'integer', 'min:1'],
            'check_in' => ['nullable', 'date', 'after_or_equal:today'],
            'check_out' => ['nullable', 'date', 'after:check_in'],
            'departure_id' => ['nullable', 'exists:listing_departures,id'],
            'special_requests' => ['nullable', 'string'],
        ]);

        $response = Http::withToken(config('services.paystack.secret'))
            ->get("https://api.paystack.co/transaction/verify/{$validated['reference']}");

        abort_unless($response->successful(), 502, 'Could not reach Paystack to verify this payment.');

        $data = $response->json('data');
        abort_unless($data['status'] === 'success', 422, 'Payment was not completed.');

        $listing = Listing::findOrFail($validated['listing_id']);
        abort_unless($listing->status === 'active', 422, 'This listing is not currently bookable.');

        $hasDepartures = $listing->departures()->exists();
        $departure = null;

        if ($hasDepartures) {
            if (empty($validated['departure_id'])) {
                throw ValidationException::withMessages(['departure_id' => ['Please select a departure date.']]);
            }
            $departure = ListingDeparture::where('id', $validated['departure_id'])
                ->where('listing_id', $listing->id)->first();
            abort_unless($departure, 422, 'Invalid departure selected.');
        } elseif (empty($validated['check_in'])) {
            throw ValidationException::withMessages(['check_in' => ['Please select a date.']]);
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
            throw ValidationException::withMessages(['guests' => ["Minimum {$listing->min_guests} guests required."]]);
        }
        if ($listing->max_guests && $validated['guests'] > $listing->max_guests) {
            throw ValidationException::withMessages(['guests' => ["Maximum {$listing->max_guests} guests allowed."]]);
        }

        if ($listing->min_lead_time_days) {
            $earliest = now()->addDays($listing->min_lead_time_days)->startOfDay();
            if (Carbon::parse($effectiveCheckIn)->startOfDay()->lt($earliest)) {
                throw ValidationException::withMessages([
                    'check_in' => ["This listing requires at least {$listing->min_lead_time_days} days' notice."],
                ]);
            }
        }

        $nights = $validated['check_out'] ?? null
            ? max(1, Carbon::parse($validated['check_out'])->diffInDays(Carbon::parse($effectiveCheckIn)))
            : 1;
        $total = $listing->price * $validated['guests'] * $nights;

        $expectedAmount = (int) round($total * 100);
        abort_unless((int) $data['amount'] === $expectedAmount, 422, 'Payment amount does not match booking total.');

        $booking = DB::transaction(function () use ($request, $listing, $departure, $effectiveCheckIn, $validated, $total, $data) {
            if ($departure) {
                $locked = ListingDeparture::where('id', $departure->id)->lockForUpdate()->first();

                if ($locked->booked >= $locked->capacity) {
                    throw ValidationException::withMessages([
                        'departure_id' => ['This departure just sold out. Please pick another date.'],
                    ]);
                }

                $locked->increment('booked');
            }

            $booking = $request->user()->bookings()->create([
                'listing_id' => $listing->id,
                'departure_id' => $departure?->id,
                'status' => 'pending',
                'guests' => $validated['guests'],
                'total' => $total,
                'payment_plan' => 'full',
                'check_in' => $effectiveCheckIn,
                'check_out' => $validated['check_out'] ?? null,
                'special_requests' => $validated['special_requests'] ?? null,
            ]);

            $booking->payments()->create([
                'amount' => $total,
                'due_date' => now()->toDateString(),
                'status' => 'paid',
                'paid_at' => now(),
                'paystack_reference' => $data['reference'],
            ]);

            return $booking;
        });

        $listing->vendor->notifications()->create([
            'type' => 'booking',
            'title' => 'New booking request',
            'message' => "{$request->user()->name} requested to book \"{$listing->title}\".",
            'link' => "/vendor/bookings/{$booking->id}",
        ]);

        $booking->load('payments');

        return response()->json(['booking' => $booking], 201);
    }


    public function show(Request $request, Booking $booking)
    {
        $this->authorizeOwnership($request, $booking);

        $booking->load(['listing.images', 'listing.itinerary', 'listing.vendor:id,business_name,phone', 'messages.sender:id,name,avatar_url', 'review', 'payments']);

        return response()->json(['booking' => $booking]);
    }

    public function initializePayment(Request $request, Booking $booking, BookingPayment $payment)
    {
        $this->authorizeOwnership($request, $booking);

        abort_unless($payment->booking_id === $booking->id, 404);
        abort_unless($payment->status === 'pending', 422, 'This payment has already been made.');

        $reference = 'pay_' . $payment->id . '_' . Str::random(12);
        $payment->update(['paystack_reference' => $reference]);

        return response()->json([
            'reference' => $reference,
            'amount' => (int) round($payment->amount * 100),
            'email' => $request->user()->email,
        ]);
    }

    public function payInstallment(Request $request, Booking $booking, BookingPayment $payment)
    {
        $this->authorizeOwnership($request, $booking);

        abort_unless($payment->booking_id === $booking->id, 404);
        abort_unless($payment->status === 'pending', 422, 'This payment has already been made.');

        $validated = $request->validate(['reference' => ['required', 'string']]);
        abort_unless($payment->paystack_reference === $validated['reference'], 422, 'Payment reference mismatch.');

        $response = Http::withToken(config('services.paystack.secret'))
            ->get("https://api.paystack.co/transaction/verify/{$validated['reference']}");

        abort_unless($response->successful(), 502, 'Could not reach Paystack to verify this payment.');

        $data = $response->json('data');
        $expectedAmount = (int) round($payment->amount * 100);

        abort_unless(
            $data['status'] === 'success' && (int) $data['amount'] === $expectedAmount,
            422,
            'Payment could not be verified.'
        );

        $payment->update(['status' => 'paid', 'paid_at' => now()]);

        return response()->json(['payment' => $payment->fresh()]);
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
