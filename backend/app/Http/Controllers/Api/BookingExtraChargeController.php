<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ExtraChargeRequestedMail;
use App\Models\Booking;
use App\Models\BookingExtraCharge;
use App\Services\BookingPayoutService;
use App\Services\MpesaClient;
use App\Services\SupportMessenger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class BookingExtraChargeController extends Controller
{
    // Vendor requests an extra charge on a completed trip — damages,
    // add-ons, overages. This never moves money on its own; the traveller
    // has to explicitly approve and pay it.
    public function store(Request $request, Booking $booking)
    {
        $vendor = $request->attributes->get('vendor');
        abort_unless($vendor && $booking->listing->vendor_id === $vendor->id, 403);
        abort_unless($booking->status === 'completed', 422, 'Extra charges can only be requested on a completed trip.');

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'description' => ['required', 'string', 'max:500'],
        ]);

        $charge = BookingExtraCharge::create([
            'booking_id' => $booking->id,
            'vendor_id' => $vendor->id,
            'amount' => $validated['amount'],
            'description' => $validated['description'],
        ]);

        $booking->loadMissing('traveller', 'listing');

        try {
            Mail::to($booking->billing_email ?? $booking->traveller->email)
                ->send(new ExtraChargeRequestedMail($charge, $booking));
        } catch (\Throwable $e) {
            Log::error('Failed to send extra charge email', ['error' => $e->getMessage()]);
        }

        try {
            SupportMessenger::sendBookingNotice(
                $booking->traveller,
                "Your host for \"{$booking->listing->title}\" has requested an extra charge of Ksh " . number_format($charge->amount, 0) . ": {$charge->description}. Review it in your trip details.",
                $booking->listing_id
            );
        } catch (\Throwable $e) {
            Log::error('Failed to post extra charge booking notice', ['error' => $e->getMessage()]);
        }

        return response()->json(['charge' => $charge], 201);
    }

    // Traveller approves and pays in one step — there's no separate
    // "approved but unpaid" state; approving IS the STK push.
    public function pay(Request $request, BookingExtraCharge $charge)
    {
        abort_unless($charge->booking->traveller_id === $request->user()->id, 403);
        abort_unless($charge->status === 'pending', 422, 'This charge has already been decided.');

        $validated = $request->validate(['phone' => ['required', 'string']]);
        $phone = MpesaClient::normalizePhone($validated['phone']);
        abort_if(!$phone, 422, 'Enter a valid Safaricom phone number.');

        $data = MpesaClient::stkPush(
            $phone,
            (int) round((float) $charge->amount),
            config('services.mpesa.extra_charge_callback_url'),
            'Erranza Extra Charge',
            $charge->description
        );

        $charge->update([
            'checkout_request_id' => $data['CheckoutRequestID'],
            'merchant_request_id' => $data['MerchantRequestID'] ?? null,
        ]);

        return response()->json(['checkout_request_id' => $data['CheckoutRequestID']]);
    }

    public function decline(Request $request, BookingExtraCharge $charge)
    {
        abort_unless($charge->booking->traveller_id === $request->user()->id, 403);
        abort_unless($charge->status === 'pending', 422, 'This charge has already been decided.');

        $charge->update(['status' => 'declined', 'decided_at' => now()]);

        $charge->vendor->notifications()->create([
            'type' => 'booking',
            'title' => 'Extra charge declined',
            'message' => "Your extra charge request (Ksh " . number_format($charge->amount, 0) . ") on booking #{$charge->booking_id} was declined by the guest.",
            'link' => "/vendor/bookings/{$charge->booking_id}",
        ]);

        return response()->json(['charge' => $charge->fresh()]);
    }

    public function status(Request $request, BookingExtraCharge $charge)
    {
        abort_unless($charge->booking->traveller_id === $request->user()->id, 403);
        return response()->json(['status' => $charge->status]);
    }

    // Public — Safaricom calls this directly, no auth.
    public function callback(Request $request)
    {
        Log::info('Extra charge payment callback', ['body' => $request->all()]);

        $callback = $request->input('Body.stkCallback');
        if (!$callback) {
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $charge = BookingExtraCharge::where('checkout_request_id', $callback['CheckoutRequestID'] ?? null)->first();
        if (!$charge || $charge->status === 'paid') {
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        if ((int) ($callback['ResultCode'] ?? 1) !== 0) {
            $charge->update(['status' => 'failed']);
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $charge->update(['status' => 'paid', 'decided_at' => now()]);

        BookingPayoutService::disburseForExtraCharge($charge);

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }
}
