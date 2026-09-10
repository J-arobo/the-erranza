<?php

use App\Models\Booking;
use App\Models\BookingPayout;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    // Every completed booking that predates the payout ledger gets a paid
    // vendor-leg + commission-leg row, so /vendor/earnings (now sourced from
    // the ledger) shows the same history it always did.
    public function up(): void
    {
        Booking::where('status', 'completed')
            ->whereDoesntHave('payouts')
            ->with('listing.vendor')
            ->chunkById(200, function ($bookings) {
                foreach ($bookings as $b) {
                    $vendor = $b->listing?->vendor;
                    if (!$vendor) {
                        continue;
                    }

                    $rate = $vendor->plan === 'plus' ? 0.08 : 0.12;
                    $commission = round($b->total * $rate, 2);
                    $net = round($b->total - $commission, 2);
                    $when = $b->check_out ?? $b->check_in ?? $b->created_at;

                    BookingPayout::create([
                        'booking_id' => $b->id, 'vendor_id' => $vendor->id,
                        'leg' => 'vendor', 'amount' => $net, 'status' => 'paid',
                        'destination' => $vendor->payout_details, 'reference' => 'BACKFILL',
                        'paid_at' => $when,
                    ]);
                    BookingPayout::create([
                        'booking_id' => $b->id, 'vendor_id' => $vendor->id,
                        'leg' => 'commission', 'amount' => $commission, 'status' => 'paid',
                        'reference' => 'BACKFILL', 'paid_at' => $when,
                    ]);
                }
            });
    }

    public function down(): void
    {
        BookingPayout::where('reference', 'BACKFILL')->delete();
    }
};
