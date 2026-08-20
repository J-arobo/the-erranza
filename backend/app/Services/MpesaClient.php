<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MpesaClient
{
    public static function baseUrl(): string
    {
        return config('services.mpesa.env') === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }

    public static function normalizePhone(string $phone): ?string
    {
        $digits = preg_replace('/\D/', '', $phone);

        if (str_starts_with($digits, '254') && strlen($digits) === 12) return $digits;
        if (str_starts_with($digits, '0') && strlen($digits) === 10) return '254' . substr($digits, 1);
        if ((str_starts_with($digits, '7') || str_starts_with($digits, '1')) && strlen($digits) === 9) return '254' . $digits;

        return null;
    }

    public static function accessToken(): string
    {
        return Cache::remember('mpesa_access_token', 3300, function () {
            $response = Http::withBasicAuth(config('services.mpesa.consumer_key'), config('services.mpesa.consumer_secret'))
                ->get(self::baseUrl() . '/oauth/v1/generate', ['grant_type' => 'client_credentials']);

            abort_unless($response->successful(), 502, 'Could not authenticate with M-Pesa.');

            return $response->json('access_token');
        });
    }

    // Returns the parsed Daraja response array, or aborts on failure.
    public static function stkPush(string $phone, int $amount, string $callbackUrl, string $accountReference, string $transactionDesc): array
    {
        $shortcode = config('services.mpesa.shortcode');
        $passkey = config('services.mpesa.passkey');
        $timestamp = now()->format('YmdHis');
        $password = base64_encode($shortcode . $passkey . $timestamp);

        $response = Http::withToken(self::accessToken())
            ->post(self::baseUrl() . '/mpesa/stkpush/v1/processrequest', [
                'BusinessShortCode' => $shortcode,
                'Password' => $password,
                'Timestamp' => $timestamp,
                'TransactionType' => 'CustomerPayBillOnline',
                'Amount' => $amount,
                'PartyA' => $phone,
                'PartyB' => $shortcode,
                'PhoneNumber' => $phone,
                'CallBackURL' => $callbackUrl,
                'AccountReference' => $accountReference,
                'TransactionDesc' => $transactionDesc,
            ]);

        if (!$response->successful()) {
            Log::error('Mpesa STK push failed', ['status' => $response->status(), 'body' => $response->body()]);
        }
        abort_unless($response->successful(), 502, 'Could not start M-Pesa request. Please try again.');

        $data = $response->json();
        abort_if(($data['ResponseCode'] ?? null) !== '0', 422, $data['ResponseDescription'] ?? 'M-Pesa could not process this request.');

        return $data;
    }

    // Business-to-Customer — used to refund the KES 1 payout-verification charge.
    public static function sendB2C(string $phone, int $amount, string $remarks, string $resultUrl, string $timeoutUrl): array
    {
        $response = Http::withToken(self::accessToken())
            ->post(self::baseUrl() . '/mpesa/b2c/v3/paymentrequest', [
                'OriginatorConversationID' => (string) \Illuminate\Support\Str::uuid(),
                'InitiatorName' => config('services.mpesa.initiator_name'),
                'SecurityCredential' => config('services.mpesa.security_credential'),
                'CommandID' => 'BusinessPayment',
                'Amount' => $amount,
                'PartyA' => config('services.mpesa.b2c_shortcode'),
                'PartyB' => $phone,
                'Remarks' => $remarks,
                'QueueTimeOutURL' => $timeoutUrl,
                'ResultURL' => $resultUrl,
                'Occassion' => 'Refund',
            ]);

        if (!$response->successful()) {
            Log::error('Mpesa B2C request failed', ['status' => $response->status(), 'body' => $response->body()]);
            return ['ok' => false];
        }

        $data = $response->json();
        if (($data['ResponseCode'] ?? null) !== '0') {
            Log::error('Mpesa B2C rejected', ['body' => $data]);
            return ['ok' => false];
        }

        return ['ok' => true, 'conversation_id' => $data['ConversationID'] ?? null];
    }

}
