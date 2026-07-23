<?php

namespace Database\Seeders;

use App\Models\Vendor;
use Illuminate\Database\Seeder;

class ListingSeeder extends Seeder
{
    public function run(): void
    {
        $vendor = Vendor::where('business_name', 'Mara Expeditions')->first();

        if (! $vendor) {
            return;
        }

        $listings = [
            [
                'title' => 'Maasai Mara Premium Safari',
                'category' => 'Safari',
                'location' => 'Narok County, Kenya',
                'description' => '3-day full board safari with expert guides and luxury tented camp.',
                'price' => 45000,
                'status' => 'active',
                'min_guests' => 2,
                'max_guests' => 12,
                'cancellation_policy' => 'moderate',
                'amenities' => ['Hotel pickup', 'All meals', 'Professional guide'],
                'views' => 860,
            ],
            [
                'title' => 'Amboseli Elephant Trek',
                'category' => 'Safari',
                'location' => 'Kajiado County, Kenya',
                'description' => '2-day safari with Maasai village visit and sundowner.',
                'price' => 28000,
                'status' => 'active',
                'cancellation_policy' => 'moderate',
                'views' => 540,
            ],
            [
                'title' => 'Nairobi City Walking Tour',
                'category' => 'Experiences',
                'location' => 'Nairobi, Kenya',
                'description' => 'Guided city walking tour covering history, culture and food.',
                'price' => 3500,
                'status' => 'paused',
                'cancellation_policy' => 'flexible',
                'views' => 1240,
            ],
            [
                'title' => 'Sunrise Balloon Safari',
                'category' => 'Experiences',
                'location' => 'Maasai Mara, Kenya',
                'description' => 'Sunrise hot air balloon ride over the Maasai Mara.',
                'price' => 78000,
                'status' => 'draft',
                'cancellation_policy' => 'strict',
                'views' => 0,
            ],
        ];

        foreach ($listings as $data) {
            $listing = $vendor->listings()->create($data);

            if ($listing->title === 'Maasai Mara Premium Safari') {
                $listing->images()->create([
                    'url' => 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80',
                    'position' => 0,
                ]);
                $listing->itinerary()->create([
                    'day' => 1,
                    'title' => 'Arrival & sundowner game drive',
                    'description' => 'Pickup from Nairobi, transfer to camp, evening game drive.',
                ]);
                $listing->departures()->create([
                    'date' => now()->addDays(14),
                    'capacity' => 12,
                    'booked' => 0,
                ]);
            }
        }
    }
}
