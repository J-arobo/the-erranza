<?php

namespace Database\Seeders;

use App\Models\Booking;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $jamesBooking = Booking::whereHas('traveller', fn ($q) => $q->where('email', 'james.kariuki@gmail.com'))
            ->where('status', 'completed')->first();

        $aminaBooking = Booking::whereHas('traveller', fn ($q) => $q->where('email', 'amina.hassan@gmail.com'))
            ->where('status', 'completed')->first();

        if ($jamesBooking) {
            $jamesBooking->review()->create([
                'listing_id' => $jamesBooking->listing_id,
                'vendor_id' => $jamesBooking->listing->vendor_id,
                'traveller_id' => $jamesBooking->traveller_id,
                'rating' => 5,
                'comment' => 'Absolutely incredible experience. The guides were knowledgeable and patient. We spotted all of the Big Five on day one. Would highly recommend!',
                'replied' => false,
            ]);
        }

        if ($aminaBooking) {
            $aminaBooking->review()->create([
                'listing_id' => $aminaBooking->listing_id,
                'vendor_id' => $aminaBooking->listing->vendor_id,
                'traveller_id' => $aminaBooking->traveller_id,
                'rating' => 5,
                'comment' => 'Best city tour I have ever done. Our guide was funny, well-informed and made the whole experience memorable.',
                'replied' => true,
                'reply_text' => 'Thank you so much for the kind words — so glad you enjoyed it!',
            ]);
        }
    }
}
