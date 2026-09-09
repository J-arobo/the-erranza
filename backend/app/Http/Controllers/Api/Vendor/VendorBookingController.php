<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use App\Models\ListingDeparture;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Mail\BookingInvoiceMail;
use App\Mail\BookingPaymentReceiptMail;
use App\Services\ListingPricingService;


class VendorBookingController extends Controller
{
    public function index(Request $request)
    {
        $vendor = $request->attributes->get('vendor');

        $bookings = Booking::whereHas('listing', fn ($q) => $q->where('vendor_id', $vendor->id))
            ->with([
                'listing:id,title,category,vendor_id,cancellation_policy,custom_cancellation_text',
                'listing.images',
                'traveller:id,name,email',
                'travelers',
            ])
            ->latest()
            ->get();

        return response()->json(['bookings' => $bookings]);
    }

    public function show(Request $request, Booking $booking)
    {
        $this->authorizeOwnership($request, $booking);

        $booking->load(['listing', 'listing.images', 'traveller', 'travelers', 'messages.sender', 'extraCharges']);

        return response()->json(['booking' => $booking]);
    }
    public function accept(Request $request, Booking $booking)
    {
        $this->authorizeOwnership($request, $booking);

        abort_unless($booking->status === 'pending', 422, 'Only pending bookings can be accepted.');

        $booking->update(['status' => 'confirmed']);

        \App\Services\BookingNotifier::notifyConfirmed($booking);

        return response()->json(['booking' => $booking]);
    }

    public function decline(Request $request, Booking $booking)
    {
        $this->authorizeOwnership($request, $booking);

        abort_unless($booking->status === 'pending', 422, 'Only pending bookings can be declined.');

        $validated = $request->validate([
            'decline_reason' => ['required', 'string', 'max:500'],
        ]);

        if ($booking->departure_id) {
            ListingDeparture::where('id', $booking->departure_id)->decrement('booked');
        }

        $booking->update(['status' => 'cancelled', 'decline_reason' => $validated['decline_reason']]);

        return response()->json(['booking' => $booking]);
    }

    public function proposeDates(Request $request, Booking $booking)
    {
        $this->authorizeOwnership($request, $booking);

        $validated = $request->validate([
            'proposed_date' => ['required', 'date'],
        ]);

        $booking->update([
            'status' => 'alternative_proposed',
            'proposed_date' => $validated['proposed_date'],
        ]);

        return response()->json(['booking' => $booking]);
    }

    public function cancel(Request $request, Booking $booking)
    {
        $this->authorizeOwnership($request, $booking);

        $validated = $request->validate([
            'refund_percent' => ['required', 'integer', 'min:0', 'max:100'],
        ]);

        if ($booking->departure_id && in_array($booking->status, ['pending', 'confirmed', 'alternative_proposed'])) {
            ListingDeparture::where('id', $booking->departure_id)->decrement('booked');
        }

        $booking->update([
            'status' => 'cancelled',
            'refund_percent' => $validated['refund_percent'],
            'refund_amount' => round($booking->total * $validated['refund_percent'] / 100, 2),
        ]);

        return response()->json(['booking' => $booking]);
    }

    private function authorizeOwnership(Request $request, Booking $booking): void
    {
        $vendor = $request->attributes->get('vendor');

        abort_unless($booking->listing->vendor_id === $vendor->id, 403);
    }

    public function store(Request $request)
    {
        $vendor = $request->attributes->get('vendor');

        $validated = $request->validate([
            'listing_id' => ['required', 'exists:listings,id'],
            'guests' => ['required', 'integer', 'min:1'],
            'check_in' => ['nullable', 'date'],
            'check_out' => ['nullable', 'date'],
            'departure_id' => ['nullable', 'exists:listing_departures,id'],
            'duration_option_id' => ['nullable', 'exists:listing_duration_options,id'],
            'pricing_mode' => ['nullable', 'in:individual,group'],
            'group_tier_id' => ['nullable', 'exists:listing_group_pricing_tiers,id'],
            'special_requests' => ['nullable', 'string'],
            'traveller_id' => ['nullable', 'exists:users,id'],
            'traveller_name' => ['required_without:traveller_id', 'string', 'max:255'],
            'traveller_email' => ['required_without:traveller_id', 'email'],
            'traveller_phone' => ['nullable', 'string', 'max:30'],
            'payment_method' => ['required', 'in:mark_paid,invoice'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'company_tax_pin' => ['nullable', 'string', 'max:20'],
            'billing_email' => ['nullable', 'email'],
        ]);

        // Scoped to this vendor's own listings only — a vendor can never
        // book against someone else's listing this way.
        $listing = $vendor->listings()->findOrFail($validated['listing_id']);

        $departure = !empty($validated['departure_id'])
            ? ListingDeparture::where('id', $validated['departure_id'])->where('listing_id', $listing->id)->first()
            : null;
        $effectiveCheckIn = $departure?->date->toDateString() ?? $validated['check_in'] ?? null;

        if ($listing->min_guests && $validated['guests'] < $listing->min_guests) {
            throw ValidationException::withMessages(['guests' => ["Minimum {$listing->min_guests} guests required."]]);
        }
        if ($listing->max_guests && $validated['guests'] > $listing->max_guests) {
            throw ValidationException::withMessages(['guests' => ["Maximum {$listing->max_guests} guests allowed."]]);
        }

        $nights = !empty($validated['check_out']) && $effectiveCheckIn
            ? max(1, \Carbon\Carbon::parse($validated['check_out'])->diffInDays(\Carbon\Carbon::parse($effectiveCheckIn)))
            : 1;

        $pricing = ListingPricingService::calculate($listing, [
            'guests' => $validated['guests'],
            'nights' => $nights,
            'check_in' => $effectiveCheckIn,
            'duration_option_id' => $validated['duration_option_id'] ?? null,
            'pricing_mode' => $validated['pricing_mode'] ?? 'individual',
            'group_tier_id' => $validated['group_tier_id'] ?? null,
        ]);
        $total = $pricing['total'];

        $traveller = ($validated['traveller_id'] ?? null)
            ? User::findOrFail($validated['traveller_id'])
            : User::firstOrCreate(
                ['email' => $validated['traveller_email']],
                [
                    'name' => $validated['traveller_name'],
                    'phone' => $validated['traveller_phone'] ?? null,
                    'password' => Hash::make(Str::random(40)),
                ]
            );

        $booking = DB::transaction(function () use ($listing, $departure, $traveller, $effectiveCheckIn, $validated, $total) {
            if ($departure) {
                $locked = ListingDeparture::where('id', $departure->id)->lockForUpdate()->first();
                abort_if($locked->booked >= $locked->capacity, 422, 'This departure is already fully booked.');
                $locked->increment('booked');
            }

            // Vendor-created bookings skip the pending/accept step entirely —
            // the vendor is the one accepting it, by definition, at creation time.
            return Booking::create([
                'listing_id' => $listing->id,
                'traveller_id' => $traveller->id,
                'departure_id' => $departure?->id,
                'status' => 'confirmed',
                'guests' => $validated['guests'],
                'total' => $total,
                'payment_plan' => 'full',
                'check_in' => $effectiveCheckIn,
                'check_out' => $validated['check_out'] ?? null,
                'special_requests' => $validated['special_requests'] ?? null,
                'created_by_vendor' => true,
                'payment_token' => Str::random(40),
                'company_name' => $validated['company_name'] ?? null,
                'company_tax_pin' => $validated['company_tax_pin'] ?? null,
                'billing_email' => $validated['billing_email'] ?? null,
                'invoice_expires_at' => $validated['payment_method'] === 'invoice' ? now()->addDays(7) : null,
            ]);
        });

        if ($validated['payment_method'] === 'mark_paid') {
            $booking->payments()->create([
                'amount' => $total,
                'due_date' => now()->toDateString(),
                'status' => 'paid',
                'paid_at' => now(),
                'paystack_reference' => 'vendor_marked_paid',
            ]);

            $booking->loadMissing('listing.vendor', 'traveller', 'payments');
            $travellerEmail = $booking->billing_email ?? $booking->traveller->email;
            try {
                Mail::to($travellerEmail)->send(new BookingPaymentReceiptMail($booking, 'vendor_marked_paid'));
            } catch (\Throwable $e) {
                Log::error('Failed to send payment receipt email', ['error' => $e->getMessage()]);
            }

            return response()->json(['booking' => $booking], 201);
        }

        $booking->payments()->create([
            'amount' => $total,
            'due_date' => now()->toDateString(),
            'status' => 'pending',
        ]);

        $paymentLink = rtrim(config('app.frontend_url'), '/') . "/pay/{$booking->payment_token}";
        try {
            Mail::to($validated['billing_email'] ?? $traveller->email)->send(new BookingInvoiceMail($booking, $paymentLink));
        } catch (\Throwable $e) {
            Log::error('Failed to send booking invoice email', ['error' => $e->getMessage()]);
        }

        return response()->json(['booking' => $booking, 'payment_link' => $paymentLink], 201);
    }

    public function searchTravellers(Request $request)
    {
        $search = $request->string('search');
        abort_if(!$search, 422, 'Enter a search term.');

        $users = User::where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })
            ->whereDoesntHave('roles', fn ($q) => $q->whereIn('name', ['admin', 'super_admin', 'partner']))
            ->limit(10)
            ->get(['id', 'name', 'email']);

        return response()->json(['users' => $users]);
    }

}
