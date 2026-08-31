<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingPayout;
use Illuminate\Support\Facades\Log;

class BookingPayoutService
{
    // Fires the instant a trip is confirmed completed. Vendor leg attempts
    // a real B2C disbursement now; commission leg is recorded but only
    // ever actually sent once ERRANZA_COMMISSION_ACCOUNT is set AND that
    // account is M-Pesa-reachable (a paybill/till, not just a bank account
    // number) — see processCommissionLeg().
    public static function process(Booking $booking): void
    {
        $booking->loadMissing('listing.vendor');
        $vendor = $booking->listing->vendor;

        $commissionRate = $vendor->plan === 'plus' ? 0.08 : 0.12;
        $commission = round((float) $booking->total * $commissionRate, 2);
        $net = round((float) $booking->total - $commission, 2);

        $vendorLeg = BookingPayout::create([
            'booking_id' => $booking->id,
            'vendor_id' => $vendor->id,
            'leg' => 'vendor',
            'amount' => $net,
            'status' => 'pending',
            'destination' => $vendor->payout_method === 'mobile' ? $vendor->payout_details : $vendor->payout_bank_name,
        ]);

        $commissionLeg = BookingPayout::create([
            'booking_id' => $booking->id,
            'vendor_id' => $vendor->id,
            'leg' => 'commission',
            'amount' => $commission,
            'status' => 'pending',
            'destination' => config('services.mpesa.commission_account') ?: 'Account B (not yet configured)',
        ]);

        self::processVendorLeg($vendorLeg, $vendor);
        self::processCommissionLeg($commissionLeg);
    }

    private static function processVendorLeg(BookingPayout $leg, $vendor): void
    {
        if ($vendor->payout_method !== 'mobile' || !$vendor->payout_details) {
            $leg->update(['failure_reason' => "Vendor's payout method is bank transfer — not automatable via M-Pesa B2C, needs manual processing."]);
            return;
        }

        $phone = MpesaClient::normalizePhone($vendor->payout_details);
        if (!$phone) {
            $leg->update(['status' => 'failed', 'failure_reason' => "Vendor's saved M-Pesa number is invalid."]);
            return;
        }

        try {
            $result = MpesaClient::sendB2C(
                $phone,
                (int) round((float) $leg->amount),
                "Erranza payout — booking #{$leg->booking_id}",
                config('services.mpesa.earnings_payout_result_url'),
                config('services.mpesa.earnings_payout_timeout_url')
            );
        } catch (\Throwable $e) {
            Log::error('Vendor payout B2C call threw', ['error' => $e->getMessage(), 'payout_id' => $leg->id]);
            $leg->update(['status' => 'failed', 'failure_reason' => $e->getMessage()]);
            return;
        }

        if (!$result['ok']) {
            $leg->update(['status' => 'failed', 'failure_reason' => 'M-Pesa rejected the B2C request.']);
            return;
        }

        $leg->update(['status' => 'processing', 'reference' => $result['conversation_id']]);
    }

    private static function processCommissionLeg(BookingPayout $leg): void
    {
        if (!config('services.mpesa.commission_account')) {
            return; // stays 'pending' — ledger entry only, see class-level note
        }

        // Stub for when Account B (or a paybill/till behind it) actually
        // exists — same sendB2C() shape as processVendorLeg() above.
    }
}
