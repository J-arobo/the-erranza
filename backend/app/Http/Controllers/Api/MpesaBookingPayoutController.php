<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BookingPayout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MpesaBookingPayoutController extends Controller
{
    // Public — Safaricom calls this when the vendor's B2C payout completes.
    public function result(Request $request)
    {
        Log::info('Mpesa booking payout result', ['body' => $request->all()]);

        $result = $request->input('Result');
        if (!$result) {
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $payout = BookingPayout::where('reference', $result['ConversationID'] ?? null)->first();
        if (!$payout) {
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        if ((int) ($result['ResultCode'] ?? 1) !== 0) {
            $payout->update([
                'status' => 'failed',
                'failure_reason' => $result['ResultDesc'] ?? 'M-Pesa payout failed.',
            ]);
            return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
        }

        $params = collect($result['ResultParameters']['ResultParameter'] ?? []);
        $receiptNumber = $params->firstWhere('Key', 'TransactionReceipt')['Value'] ?? null;

        $payout->update([
            'status' => 'paid',
            'reference' => $receiptNumber ?? $payout->reference,
            'paid_at' => now(),
        ]);

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }

    // Public — Safaricom calls this if the B2C request times out in the queue.
    public function timeout(Request $request)
    {
        Log::warning('Mpesa booking payout timeout', ['body' => $request->all()]);

        $result = $request->input('Result');
        $payout = BookingPayout::where('reference', $result['ConversationID'] ?? null)->first();
        $payout?->update(['status' => 'failed', 'failure_reason' => 'Timed out in the M-Pesa queue.']);

        return response()->json(['ResultCode' => 0, 'ResultDesc' => 'Accepted']);
    }
}
