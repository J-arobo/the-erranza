<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\MpesaPayoutVerification;
use App\Models\Vendor;
use App\Services\MpesaClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VendorPayoutVerificationController extends Controller
{
    public function initiate(Request $request)
    {
        $vendor = $request->attributes->get('vendor');

        $validated = $request->validate(['phone' => ['required', 'string']]);
        $phone = MpesaClient::normalizePhone($validated['phone']);
        abort_if(!$phone, 422, 'Enter a valid Safaricom phone number.');

        $data = MpesaClient::stkPush(
            $phone,
            1,
            config('services.mpesa.payout_callback_url'),
            'Erranza Payout',
            'Payout number verification'
        );

        $verification = MpesaPayoutVerification::create([
            'vendor_id' => $vendor->id,
            'phone' => $phone,
            'amount' => 1,
            'checkout_request_id' => $data['CheckoutRequestID'],
            'merchant_request_id' => $data['MerchantRequestID'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json(['checkout_request_id' => $verification->checkout_request_id]);
    }

    // Public — Safaricom calls this directly, no auth. Always return 200 or
    // Safaricom will keep retrying the same callback.
    public function callback(Request $request)
    {
        Log::info('Mpesa payout verification callback', ['body' => $request->all()]);

        $callback = $request->input('Body.stkCallback');
        if (!$callback) {
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $verification = MpesaPayoutVerification::where('checkout_request_id', $callback['CheckoutRequestID'] ?? null)->first();
        if (!$verification || $verification->status !== 'pending') {
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        if ((int) ($callback['ResultCode'] ?? 1) !== 0) {
            $verification->update([
                'status' => 'failed',
                'result_desc' => $callback['ResultDesc'] ?? 'The M-Pesa prompt was not completed.',
            ]);
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $items = collect($callback['CallbackMetadata']['Item'] ?? []);
        $receiptNumber = $items->firstWhere('Name', 'MpesaReceiptNumber')['Value'] ?? null;

        $verification->update([
            'status' => 'success',
            'mpesa_receipt_number' => $receiptNumber,
        ]);

        Vendor::where('id', $verification->vendor_id)->update([
            'payout_method' => 'mobile',
            'payout_details' => $verification->phone,
        ]);

        $this->triggerRefund($verification);

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }

    private function triggerRefund(MpesaPayoutVerification $verification): void
    {
        $result = MpesaClient::sendB2C(
            $verification->phone,
            (int) $verification->amount,
            'Payout number verification refund',
            config('services.mpesa.refund_result_url'),
            config('services.mpesa.refund_timeout_url')
        );

        $verification->update([
            'refund_status' => $result['ok'] ? 'pending' : 'failed_to_initiate',
            'refund_conversation_id' => $result['conversation_id'] ?? null,
        ]);
    }

    // Public — Safaricom calls this when the B2C refund completes (success or failure).
    public function refundResult(Request $request)
    {
        Log::info('Mpesa B2C refund result', ['body' => $request->all()]);

        $result = $request->input('Result');
        if (!$result) {
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $verification = MpesaPayoutVerification::where('refund_conversation_id', $result['ConversationID'] ?? null)->first();
        if (!$verification) {
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        if ((int) ($result['ResultCode'] ?? 1) !== 0) {
            $verification->update([
                'refund_status' => 'failed',
            ]);
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $params = collect($result['ResultParameters']['ResultParameter'] ?? []);
        $receiptNumber = $params->firstWhere('Key', 'TransactionReceipt')['Value'] ?? null;

        $verification->update([
            'refund_status' => 'completed',
            'refund_receipt_number' => $receiptNumber,
            'refunded_at' => now(),
        ]);

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }

    // Public — Safaricom calls this if the B2C request times out in the queue.
    public function refundTimeout(Request $request)
    {
        Log::warning('Mpesa B2C refund timeout', ['body' => $request->all()]);

        $result = $request->input('Result');
        $verification = MpesaPayoutVerification::where('refund_conversation_id', $result['ConversationID'] ?? null)->first();
        $verification?->update(['refund_status' => 'timed_out']);

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }

    public function status(Request $request, string $checkoutRequestId)
    {
        $vendor = $request->attributes->get('vendor');

        $verification = MpesaPayoutVerification::where('checkout_request_id', $checkoutRequestId)
            ->where('vendor_id', $vendor->id)
            ->firstOrFail();

        return response()->json([
            'status' => $verification->status,
            'message' => $verification->result_desc,
        ]);
    }
}
