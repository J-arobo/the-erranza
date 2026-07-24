<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Listing;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    private const COMMENTS = [
        ['rating' => 5, 'text' => 'Absolutely incredible experience from start to finish. Highly recommend!'],
        ['rating' => 5, 'text' => 'Everything was well organized and the team was super friendly and professional.'],
        ['rating' => 4, 'text' => 'Great value for money — a couple of minor hiccups but overall a really solid trip.'],
        ['rating' => 5, 'text' => 'Exceeded our expectations. A trip we will remember for a long time.'],
        ['rating' => 4, 'text' => 'Really enjoyable and well run, just wish it was a little longer.'],
        ['rating' => 5, 'text' => 'Professional guides, beautiful views, and smooth communication throughout.'],
        ['rating' => 4, 'text' => 'Solid experience overall, good communication both before and during.'],
        ['rating' => 5, 'text' => 'One of the best things we did on our trip to Kenya — would book again.'],
    ];

    public function run(): void
    {
        // ── Two original, hand-written reviews on real James/Amina bookings ──
        $jamesBooking = Booking::whereHas('traveller', fn ($q) => $q->where('email', 'james.kariuki@gmail.com'))
            ->where('status', 'completed')->first();

        $aminaBooking = Booking::whereHas('traveller', fn ($q) => $q->where('email', 'amina.hassan@gmail.com'))
            ->where('status', 'completed')->first();

        if ($jamesBooking && ! $jamesBooking->review) {
            $jamesBooking->review()->create([
                'listing_id' => $jamesBooking->listing_id,
                'vendor_id' => $jamesBooking->listing->vendor_id,
                'traveller_id' => $jamesBooking->traveller_id,
                'rating' => 5,
                'comment' => 'Absolutely incredible experience. The guides were knowledgeable and patient. We spotted all of the Big Five on day one. Would highly recommend!',
                'replied' => false,
            ]);
        }

        if ($aminaBooking && ! $aminaBooking->review) {
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

        // ── Top every listing up to at least 4 reviews so ratings never
        // look empty in the UI, backed by real completed bookings since
        // reviews require a valid booking_id. ──
        $travellerRole = Role::where('name', 'traveller')->first();

        Listing::all()->each(function (Listing $listing) use ($travellerRole) {
            $needed = max(0, 4 - $listing->reviews()->count());

            for ($i = 0; $i < $needed; $i++) {
                $traveller = User::factory()->create(['active_role' => 'traveller']);

                if ($travellerRole) {
                    $traveller->roles()->syncWithoutDetaching($travellerRole);
                }

                $checkIn = now()->subDays(rand(10, 200));
                $checkOut = $listing->category === 'Stays' ? $checkIn->copy()->addDays(rand(1, 5)) : null;

                $booking = Booking::create([
                    'listing_id' => $listing->id,
                    'traveller_id' => $traveller->id,
                    'status' => 'completed',
                    'guests' => rand(1, max(1, min(4, $listing->max_guests ?? 4))),
                    'total' => $listing->price,
                    'check_in' => $checkIn,
                    'check_out' => $checkOut,
                ]);

                $pick = self::COMMENTS[array_rand(self::COMMENTS)];

                $booking->review()->create([
                    'listing_id' => $listing->id,
                    'vendor_id' => $listing->vendor_id,
                    'traveller_id' => $traveller->id,
                    'rating' => $pick['rating'],
                    'comment' => $pick['text'],
                    'replied' => false,
                ]);
            }
        });
    }
}
