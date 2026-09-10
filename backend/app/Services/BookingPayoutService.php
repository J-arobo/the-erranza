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

        // Re-attempts a vendor payout leg that previously failed — used after the
    // vendor fixes their M-Pesa number. Resets the leg to pending first.
    public static function retryVendorLeg(BookingPayout $leg): void
    {
        $leg->loadMissing('vendor');
        $leg->update(['status' => 'pending', 'failure_reason' => null, 'reference' => null]);
        self::processVendorLeg($leg, $leg->vendor);
    }

        // Fires once a vendor B2C payout is confirmed by Safaricom — notifies the
    // vendor in-app + by email, and emails Erranza ops a settlement summary
    // (vendor net + the commission taken on the same booking).
    public static function notifyVendorLegPaid(BookingPayout $leg): void
    {
        if ($leg->leg !== 'vendor' || $leg->status !== 'paid') {
            return;
        }

        $leg->loadMissing('vendor', 'booking.listing:id,title', 'booking.traveller:id,name');

        $vendor = $leg->vendor;
        $listingTitle = $leg->booking?->listing?->title ?? "Booking #{$leg->booking_id}";
        $travellerName = $leg->booking?->traveller?->name ?? 'a guest';
        $net = (float) $leg->amount;

        $commission = (float) BookingPayout::where('booking_id', $leg->booking_id)
            ->where('leg', 'commission')
            ->value('amount');

        $vendor->notifications()->create([
            'type' => 'system',
            'title' => 'You\'ve been paid',
            'message' => 'KES ' . number_format($net) . " for {$listingTitle} ({$travellerName}), sent to {$leg->destination}. Ref {$leg->reference}.",
            'link' => '/vendor/earnings#payouts',
        ]);

        $opsEmail = config('services.erranza.ops_email');

        defer(function () use ($vendor, $leg, $listingTitle, $travellerName, $net, $commission, $opsEmail) {
            try {
                \Illuminate\Support\Facades\Mail::to($vendor->email)
                    ->send(new \App\Mail\VendorPayoutPaidMail($vendor->business_name, $net, $listingTitle, $leg->reference, $leg->destination));

                if ($opsEmail) {
                    \Illuminate\Support\Facades\Mail::to($opsEmail)
                        ->send(new \App\Mail\PlatformPayoutSettledMail(
                            $vendor->business_name, $leg->booking_id, $listingTitle, $travellerName,
                            $net, $commission, $leg->reference, $leg->destination,
                        ));
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Failed to send payout settlement emails', ['error' => $e->getMessage(), 'payout_id' => $leg->id]);
            }
        });
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
            $leg->update([
                'status' => 'manual',
                'destination' => $vendor->payout_bank_name,
                'failure_reason' => 'Bank transfer — processed manually by Erranza.',
            ]);
            return;
        }

        $leg->update(['destination' => $vendor->payout_details]);

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
