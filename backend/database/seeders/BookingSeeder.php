<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Listing;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $travellerRole = Role::where('name', 'traveller')->first();

        $travellers = [
            'Sarah Omondi' => 'sarah.omondi@gmail.com',
            'Mark Gillet' => 'mark.gillet@gmail.com',
            'James Kariuki' => 'james.kariuki@gmail.com',
            'Amina Hassan' => 'amina.hassan@gmail.com',
        ];

        $users = [];
        foreach ($travellers as $name => $email) {
            $user = User::firstOrCreate(
                ['email' => $email],
                ['name' => $name, 'password' => Hash::make('password'), 'active_role' => 'traveller']
            );
            $user->roles()->syncWithoutDetaching($travellerRole);
            $users[$name] = $user;
        }

        $maraSafari = Listing::where('title', 'Maasai Mara Premium Safari')->first();
        $amboseli = Listing::where('title', 'Amboseli Elephant Trek')->first();
        $walkingTour = Listing::where('title', 'Nairobi City Walking Tour')->first();

        if (! $maraSafari || ! $amboseli || ! $walkingTour) {
            return;
        }

        $bookingsData = [
            [
                'listing' => $maraSafari,
                'traveller' => $users['Sarah Omondi'],
                'status' => 'confirmed',
                'guests' => 2,
                'total' => 90000,
                'check_in' => now()->addDays(20),
                'check_out' => now()->addDays(23),
                'special_requests' => 'One traveler uses a wheelchair — please confirm vehicle accessibility.',
                'travelers' => ['Sarah Omondi', 'David Omondi'],
                'message' => 'Hi, we are very excited for the trip!',
            ],
            [
                'listing' => $amboseli,
                'traveller' => $users['Mark Gillet'],
                'status' => 'pending',
                'guests' => 1,
                'total' => 28000,
                'check_in' => now()->addDays(25),
                'check_out' => now()->addDays(27),
                'special_requests' => 'Vegetarian meals required.',
                'travelers' => ['Mark Gillet'],
                'message' => 'Can you accommodate a vegetarian diet?',
            ],
            [
                'listing' => $maraSafari,
                'traveller' => $users['James Kariuki'],
                'status' => 'completed',
                'guests' => 4,
                'total' => 180000,
                'check_in' => now()->subDays(60),
                'check_out' => now()->subDays(57),
                'travelers' => ['James Kariuki', 'Grace Kariuki', 'Peter Kariuki', 'Lucy Kariuki'],
                'message' => 'Do you offer transfers from JKIA airport?',
            ],
            [
                'listing' => $walkingTour,
                'traveller' => $users['Amina Hassan'],
                'status' => 'completed',
                'guests' => 3,
                'total' => 10500,
                'check_in' => now()->subDays(90),
                'check_out' => now()->subDays(90),
                'travelers' => ['Amina Hassan', 'Yusuf Hassan', 'Fatima Hassan'],
                'message' => 'Is the walking tour suitable for kids under 10?',
            ],
        ];

        foreach ($bookingsData as $data) {
            $booking = Booking::create([
                'listing_id' => $data['listing']->id,
                'traveller_id' => $data['traveller']->id,
                'status' => $data['status'],
                'guests' => $data['guests'],
                'total' => $data['total'],
                'check_in' => $data['check_in'],
                'check_out' => $data['check_out'],
                'special_requests' => $data['special_requests'] ?? null,
            ]);

            foreach ($data['travelers'] as $name) {
                $booking->travelers()->create(['name' => $name]);
            }

            if (isset($data['message'])) {
                $booking->messages()->create([
                    'sender_type' => 'guest',
                    'sender_id' => $data['traveller']->id,
                    'text' => $data['message'],
                ]);
            }
        }
    }
}
