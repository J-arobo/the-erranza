<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Services\MpesaClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PublicBookingPaymentController extends Controller
{
    public function show(Request $request, string $token)
    {
        $booking = Booking::where('payment_token', $token)->with('listing.images')->firstOrFail();
        $payment = $booking->payments()->latest()->first();

        return response()->json([
            'listing_title' => $booking->listing->title,
            'listing_image' => $booking->listing->images->first()?->url,
            'guests' => $booking->guests,
            'check_in' => $booking->check_in,
            'check_out' => $booking->check_out,
            'total' => $booking->total,
            'paid' => $payment?->status === 'paid',
            'expires_at' => $booking->invoice_expires_at,
            'expired' => $booking->invoice_expires_at !== null && $booking->invoice_expires_at->isPast(),
        ]);
    }

    public function pay(Request $request, string $token)
    {
        $booking = Booking::where('payment_token', $token)->firstOrFail();
        abort_if($booking->invoice_expires_at && $booking->invoice_expires_at->isPast(), 422, 'This invoice has expired. Please contact us for a new one.');

        $payment = $booking->payments()->latest()->first();
        abort_if(!$payment || $payment->status === 'paid', 422, 'This invoice is already paid.');

        $validated = $request->validate(['phone' => ['required', 'string']]);
        $phone = MpesaClient::normalizePhone($validated['phone']);
        abort_if(!$phone, 422, 'Enter a valid Safaricom phone number.');

        $data = MpesaClient::stkPush(
            $phone,
            (int) round($payment->amount),
            config('services.mpesa.invoice_callback_url'),
            'Erranza Booking',
            "Payment for {$booking->listing->title}"
        );

        $payment->update([
            'checkout_request_id' => $data['CheckoutRequestID'],
            'merchant_request_id' => $data['MerchantRequestID'] ?? null,
        ]);

        return response()->json(['checkout_request_id' => $data['CheckoutRequestID']]);
    }

    public function initializeCard(Request $request, string $token)
    {
        $booking = Booking::where('payment_token', $token)->with('traveller')->firstOrFail();
        abort_if($booking->invoice_expires_at && $booking->invoice_expires_at->isPast(), 422, 'This invoice has expired. Please contact us for a new one.');

        $payment = $booking->payments()->latest()->first();
        abort_if(!$payment || $payment->status === 'paid', 422, 'This invoice is already paid.');

        $reference = 'pay_' . $payment->id . '_' . \Illuminate\Support\Str::random(12);
        $payment->update(['paystack_reference' => $reference]);

        return response()->json([
            'reference' => $reference,
            'amount' => (int) round($payment->amount * 100),
            'email' => $booking->billing_email ?? $booking->traveller->email,
        ]);
    }

    public function verifyCard(Request $request, string $token)
    {
        $booking = Booking::where('payment_token', $token)->firstOrFail();
        $payment = $booking->payments()->latest()->first();
        abort_if(!$payment || $payment->status === 'paid', 422, 'This invoice is already paid.');

        $validated = $request->validate(['reference' => ['required', 'string']]);
        abort_unless($payment->paystack_reference === $validated['reference'], 422, 'Payment reference mismatch.');

        $response = \Illuminate\Support\Facades\Http::withToken(config('services.paystack.secret'))
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
        // Payment notification to both traveller and vendor
        $payment->update(['status' => 'paid', 'paid_at' => now()]);

        \App\Services\BookingNotifier::notifyPaid($payment->booking);

        return response()->json(['payment' => $payment->fresh()]);
    }

    public function status(Request $request, string $token, string $checkoutRequestId)
    {
        $booking = Booking::where('payment_token', $token)->firstOrFail();
        $payment = $booking->payments()->where('checkout_request_id', $checkoutRequestId)->firstOrFail();

        return response()->json(['status' => $payment->status]);
    }

    // Public — Safaricom calls this directly, no auth.
    public function callback(Request $request)
    {
        Log::info('Public booking payment callback', ['body' => $request->all()]);

        $callback = $request->input('Body.stkCallback');
        if (!$callback) {
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $payment = BookingPayment::where('checkout_request_id', $callback['CheckoutRequestID'] ?? null)->first();
        if (!$payment || $payment->status === 'paid') {
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        if ((int) ($callback['ResultCode'] ?? 1) !== 0) {
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $items = collect($callback['CallbackMetadata']['Item'] ?? []);
        $receiptNumber = $items->firstWhere('Name', 'MpesaReceiptNumber')['Value'] ?? null;

        $payment->update([
            'status' => 'paid',
            'paid_at' => now(),
            'paystack_reference' => 'mpesa_' . $receiptNumber,
        ]);

        \App\Services\BookingNotifier::notifyPaid($payment->booking);

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }
}
