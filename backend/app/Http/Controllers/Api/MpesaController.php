<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\ListingDeparture;
use App\Models\MpesaStkRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

//For debugging
use Illuminate\Support\Facades\Log;


class MpesaController extends Controller
{
    private function baseUrl(): string
    {
        return config('services.mpesa.env') === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }

    private function normalizePhone(string $phone): ?string
    {
        $digits = preg_replace('/\D/', '', $phone);

        if (str_starts_with($digits, '254') && strlen($digits) === 12) return $digits;
        if (str_starts_with($digits, '0') && strlen($digits) === 10) return '254' . substr($digits, 1);
        if ((str_starts_with($digits, '7') || str_starts_with($digits, '1')) && strlen($digits) === 9) return '254' . $digits;

        return null;
    }

    private function getAccessToken(): string
    {
        return Cache::remember('mpesa_access_token', 3300, function () {
            $response = Http::withBasicAuth(config('services.mpesa.consumer_key'), config('services.mpesa.consumer_secret'))
                ->get("{$this->baseUrl()}/oauth/v1/generate", ['grant_type' => 'client_credentials']);

            abort_unless($response->successful(), 502, 'Could not authenticate with M-Pesa.');

            return $response->json('access_token');
        });
    }

    public function initiate(Request $request)
    {
        $validated = $request->validate([
            'listing_id' => ['required', 'exists:listings,id'],
            'guests' => ['required', 'integer', 'min:1'],
            'check_in' => ['nullable', 'date'],
            'check_out' => ['nullable', 'date'],
            'departure_id' => ['nullable', 'exists:listing_departures,id'],
            'phone' => ['required', 'string'],
        ]);

        $phone = $this->normalizePhone($validated['phone']);
        abort_if(!$phone, 422, 'Enter a valid Safaricom phone number.');

        $listing = Listing::findOrFail($validated['listing_id']);
        $departure = !empty($validated['departure_id'])
            ? ListingDeparture::where('id', $validated['departure_id'])->where('listing_id', $listing->id)->first()
            : null;
        $effectiveCheckIn = $departure?->date->toDateString() ?? $validated['check_in'] ?? null;

        $nights = !empty($validated['check_out']) && $effectiveCheckIn
            ? max(1, Carbon::parse($validated['check_out'])->diffInDays(Carbon::parse($effectiveCheckIn)))
            : 1;

        $total = $listing->price * $validated['guests'] * $nights;
        $amount = (int) round($total);

        $shortcode = config('services.mpesa.shortcode');
        $passkey = config('services.mpesa.passkey');
        $timestamp = now()->format('YmdHis');
        $password = base64_encode($shortcode . $passkey . $timestamp);

        $response = Http::withToken($this->getAccessToken())
            ->post("{$this->baseUrl()}/mpesa/stkpush/v1/processrequest", [
                'BusinessShortCode' => $shortcode,
                'Password' => $password,
                'Timestamp' => $timestamp,
                'TransactionType' => 'CustomerPayBillOnline',
                'Amount' => $amount,
                'PartyA' => $phone,
                'PartyB' => $shortcode,
                'PhoneNumber' => $phone,
                'CallBackURL' => config('services.mpesa.callback_url'),
                'AccountReference' => 'Erranza',
                'TransactionDesc' => "Booking payment for {$listing->title}",
            ]);

        abort_unless($response->successful(), 502, 'Could not start M-Pesa payment. Please try again.');

        $data = $response->json();
        abort_if(($data['ResponseCode'] ?? null) !== '0', 422, $data['ResponseDescription'] ?? 'M-Pesa could not process this request.');

        $stkRequest = MpesaStkRequest::create([
            'traveller_id' => $request->user()->id,
            'listing_id' => $listing->id,
            'guests' => $validated['guests'],
            'check_in' => $effectiveCheckIn,
            'check_out' => $validated['check_out'] ?? null,
            'departure_id' => $departure?->id,
            'phone' => $phone,
            'amount' => $total,
            'checkout_request_id' => $data['CheckoutRequestID'],
            'merchant_request_id' => $data['MerchantRequestID'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json(['checkout_request_id' => $stkRequest->checkout_request_id]);
    }

    // Public — Safaricom calls this directly, no auth. Always return 200 or
    // Safaricom will keep retrying the same callback.
    public function callback(Request $request)
    {
        //Debugging
        Log::info('Mpesa callback raw payload', ['body' => $request->all()]);

        $callback = $request->input('Body.stkCallback');
        if (!$callback) {
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $stkRequest = MpesaStkRequest::where('checkout_request_id', $callback['CheckoutRequestID'] ?? null)->first();
        if (!$stkRequest || $stkRequest->status !== 'pending') {
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        if ((int) ($callback['ResultCode'] ?? 1) !== 0) {
            $stkRequest->update([
                'status' => 'failed',
                'result_desc' => $callback['ResultDesc'] ?? 'Payment was not completed.',
            ]);
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $items = collect($callback['CallbackMetadata']['Item'] ?? []);
        $receiptNumber = $items->firstWhere('Name', 'MpesaReceiptNumber')['Value'] ?? null;
        $paidAmount = $items->firstWhere('Name', 'Amount')['Value'] ?? null;

        if ((int) round($stkRequest->amount) !== (int) $paidAmount) {
            $stkRequest->update(['status' => 'failed', 'result_desc' => 'Amount mismatch.']);
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $listing = Listing::find($stkRequest->listing_id);
        if (!$listing || $listing->status !== 'active') {
            $stkRequest->update(['status' => 'failed', 'result_desc' => 'Listing no longer available.']);
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        try {
            $booking = DB::transaction(function () use ($stkRequest, $listing, $receiptNumber) {
                $departure = null;

                if ($stkRequest->departure_id) {
                    $departure = ListingDeparture::where('id', $stkRequest->departure_id)->lockForUpdate()->first();
                    if (!$departure || $departure->booked >= $departure->capacity) {
                        throw new \RuntimeException('This departure just sold out.');
                    }
                    $departure->increment('booked');
                } elseif ($listing->category === 'Stays' && $stkRequest->check_out) {
                    $checkIn = Carbon::parse($stkRequest->check_in);
                    $checkOut = Carbon::parse($stkRequest->check_out);
                    $overlapping = $listing->bookings()
                        ->whereIn('status', ['pending', 'confirmed', 'alternative_proposed'])
                        ->whereNotNull('check_out')
                        ->where('check_in', '<', $checkOut)
                        ->where('check_out', '>', $checkIn)
                        ->exists();
                    if ($overlapping) {
                        throw new \RuntimeException('These dates are no longer available.');
                    }
                }

                $booking = User::find($stkRequest->traveller_id)->bookings()->create([
                    'listing_id' => $listing->id,
                    'departure_id' => $departure?->id,
                    'status' => 'pending',
                    'guests' => $stkRequest->guests,
                    'total' => $stkRequest->amount,
                    'payment_plan' => 'full',
                    'check_in' => $stkRequest->check_in,
                    'check_out' => $stkRequest->check_out,
                    'special_requests' => $stkRequest->special_requests,
                ]);

                $booking->payments()->create([
                    'amount' => $stkRequest->amount,
                    'due_date' => now()->toDateString(),
                    'status' => 'paid',
                    'paid_at' => now(),
                    'paystack_reference' => 'mpesa_' . $receiptNumber,
                ]);

                return $booking;
            });

            $listing->vendor->notifications()->create([
                'type' => 'booking',
                'title' => 'New booking request',
                'message' => "A traveller requested to book \"{$listing->title}\".",
                'link' => "/vendor/bookings/{$booking->id}",
            ]);

            $stkRequest->update([
                'status' => 'success',
                'mpesa_receipt_number' => $receiptNumber,
                'booking_id' => $booking->id,
            ]);
        } catch (\Throwable $e) {
            $stkRequest->update(['status' => 'failed', 'result_desc' => $e->getMessage()]);
        }

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }

    public function status(Request $request, string $checkoutRequestId)
    {
        $stkRequest = MpesaStkRequest::where('checkout_request_id', $checkoutRequestId)
            ->where('traveller_id', $request->user()->id)
            ->firstOrFail();

        return response()->json([
            'status' => $stkRequest->status,
            'booking_id' => $stkRequest->booking_id,
            'message' => $stkRequest->result_desc,
        ]);
    }
}
