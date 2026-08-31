<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingExtraCharge;
use App\Models\BookingPayout;
use App\Models\Vendor;
use Illuminate\Support\Facades\Log;

class BookingPayoutService
{
    // Fires the instant a trip is confirmed completed.
    public static function process(Booking $booking): void
    {
        $booking->loadMissing('listing.vendor');
        self::disburseSplit($booking, $booking->listing->vendor, (float) $booking->total);
    }

    // Fires when a guest pays an approved extra charge — same split logic,
    // just against the charge's amount instead of the booking's total.
    public static function disburseForExtraCharge(BookingExtraCharge $charge): void
    {
        $charge->loadMissing('booking', 'vendor');
        self::disburseSplit($charge->booking, $charge->vendor, (float) $charge->amount);
    }

    private static function disburseSplit(Booking $booking, Vendor $vendor, float $amount): void
    {
        $commissionRate = $vendor->plan === 'plus' ? 0.08 : 0.12;
        $commission = round($amount * $commissionRate, 2);
        $net = round($amount - $commission, 2);

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

    private static function processVendorLeg(BookingPayout $leg, Vendor $vendor): void
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
            return;
        }
        // Stub for when Account B (or a paybill/till behind it) exists.
    }
}
