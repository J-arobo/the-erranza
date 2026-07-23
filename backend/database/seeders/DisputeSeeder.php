<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Dispute;
use Illuminate\Database\Seeder;

class DisputeSeeder extends Seeder
{
    public function run(): void
    {
        $sarahBooking = Booking::whereHas('traveller', fn ($q) => $q->where('email', 'sarah.omondi@gmail.com'))->first();
        $jamesBooking = Booking::whereHas('traveller', fn ($q) => $q->where('email', 'james.kariuki@gmail.com'))->first();
        $aminaBooking = Booking::whereHas('traveller', fn ($q) => $q->where('email', 'amina.hassan@gmail.com'))->first();

        if ($sarahBooking) {
            Dispute::create([
                'booking_id' => $sarahBooking->id,
                'raised_by' => $sarahBooking->traveller_id,
                'amount' => 8500,
                'reason' => 'Guest cancelled 2 hours before pickup, requesting partial refund.',
                'status' => 'open',
            ]);
        }

        if ($jamesBooking) {
            Dispute::create([
                'booking_id' => $jamesBooking->id,
                'raised_by' => $jamesBooking->traveller_id,
                'amount' => 15000,
                'reason' => 'Tour shortened by half a day due to weather; guest requests partial refund.',
                'status' => 'auto_approved',
                'resolved_at' => now()->subDays(3),
            ]);
        }

        if ($aminaBooking) {
            Dispute::create([
                'booking_id' => $aminaBooking->id,
                'raised_by' => $aminaBooking->traveller_id,
                'amount' => 45000,
                'reason' => 'Guest reports vehicle breakdown ended the trip early, requesting full refund.',
                'status' => 'escalated',
            ]);
        }
    }
}
