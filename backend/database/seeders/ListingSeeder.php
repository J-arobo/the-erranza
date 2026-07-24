<?php

namespace Database\Seeders;

use App\Models\Listing;
use App\Models\Vendor;
use Illuminate\Database\Seeder;

class ListingSeeder extends Seeder
{
    private const SAFARI_IMAGES = [
        'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80',
        'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80',
        'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=80',
        'https://images.unsplash.com/photo-1518459384564-ecfd8e80721f?w=800&q=80',
        'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80',
        'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=800&q=80',
        'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800&q=80',
        'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800&q=80',
        'https://images.unsplash.com/photo-1521651201144-634f700b36ef?w=800&q=80',
        'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80',
        'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&q=80',
    ];

    private const STAYS_IMAGES = [
        'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
        'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
        'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
        'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80',
        'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=800&q=80',
        'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=800&q=80',
        'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=800&q=80',
    ];

    private const PACKAGES_IMAGES = [
        'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80',
        'https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?w=800&q=80',
        'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=80',
        'https://images.unsplash.com/photo-1516815231560-8f41ec531527?w=800&q=80',
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
        'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80',
        'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80',
        'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80',
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
    ];

    private const EXPERIENCES_IMAGES = [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
        'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80',
        'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80',
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
    ];

    public function run(): void
    {
        $vendor = Vendor::where('business_name', 'Mara Expeditions')->first();

        if (! $vendor) {
            return;
        }

        // ── Original 4 listings — kept exactly as-is; BookingSeeder looks these
        // up by exact title, so don't rename or remove them. ──
        $original = [
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

        foreach ($original as $seed => $data) {
            $listing = $vendor->listings()->create($data);
            $this->attachImages($listing, $data['category'], $seed);

            if ($listing->title === 'Maasai Mara Premium Safari') {
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

        // ── Additional listings — enough per theme so every browse-page
        // section (Maasai Mara safaris, Amboseli safaris, Popular stays in
        // Nairobi, Beachfront villas, Lakeside retreats, Curated packages)
        // has at least 9 real listings, not just the original handful. ──
        $more = [

            // ═══ Safari — Maasai Mara bucket (8 more; 9 with the original) ═══
            ['data' => ['title' => 'Mara Migration River Crossing Safari', 'category' => 'Safari', 'location' => 'Maasai Mara, Kenya', 'description' => 'Witness the Great Migration river crossings with expert spotters who track herd movements daily.', 'price' => 52000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 10, 'cancellation_policy' => 'strict', 'amenities' => ['Hotel pickup', 'All meals', 'Professional guide'], 'views' => 430]],
            ['data' => ['title' => 'Maasai Mara Balloon Safari Experience', 'category' => 'Safari', 'location' => 'Maasai Mara, Kenya', 'description' => 'Sunrise balloon flight over the Mara plains followed by a champagne bush breakfast and game drive.', 'price' => 68000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 8, 'cancellation_policy' => 'strict', 'amenities' => ['All meals', 'Professional guide', 'Champagne breakfast'], 'views' => 510]],
            ['data' => ['title' => 'Maasai Mara Cultural & Wildlife Safari', 'category' => 'Safari', 'location' => 'Narok County, Kenya', 'description' => 'Combine game drives with an authentic visit to a local Maasai village and its traditions.', 'price' => 41000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 12, 'cancellation_policy' => 'moderate', 'amenities' => ['Hotel pickup', 'All meals', 'Professional guide'], 'views' => 300]],
            ['data' => ['title' => 'Mara Triangle Photographic Safari', 'category' => 'Safari', 'location' => 'Maasai Mara, Kenya', 'description' => 'Small-group photography-focused safari with specialist vehicles and a professional wildlife photographer guide.', 'price' => 47000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 6, 'cancellation_policy' => 'moderate', 'amenities' => ['Professional guide', 'Sunroof vehicle', 'Binoculars provided'], 'views' => 265]],
            ['data' => ['title' => 'Maasai Mara Budget Camping Safari', 'category' => 'Safari', 'location' => 'Narok County, Kenya', 'description' => 'Affordable camping safari with shared tented accommodation and all park fees included.', 'price' => 22000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 14, 'cancellation_policy' => 'flexible', 'amenities' => ['Park fees included', 'Local guide', 'Bottled water'], 'views' => 610]],
            ['data' => ['title' => 'Maasai Mara Luxury Tented Camp Safari', 'category' => 'Safari', 'location' => 'Maasai Mara, Kenya', 'description' => 'Stay in an award-winning luxury tented camp with butler service and private game drives.', 'price' => 95000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 10, 'cancellation_policy' => 'strict', 'amenities' => ['All meals', 'Professional guide', 'Private vehicle'], 'views' => 180]],
            ['data' => ['title' => 'Mara River Big Cats Safari', 'category' => 'Safari', 'location' => 'Maasai Mara, Kenya', 'description' => 'Focused big-cat tracking safari through territories known for lion, leopard and cheetah sightings.', 'price' => 39000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 8, 'cancellation_policy' => 'moderate', 'amenities' => ['Hotel pickup', 'All meals', 'Professional guide'], 'views' => 355]],
            ['data' => ['title' => 'Maasai Mara Family Safari Adventure', 'category' => 'Safari', 'location' => 'Narok County, Kenya', 'description' => 'Family-friendly safari itinerary with shorter drives, kid-friendly guides and flexible meal times.', 'price' => 44000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 12, 'cancellation_policy' => 'moderate', 'amenities' => ['Hotel pickup', 'All meals', 'Professional guide'], 'views' => 290]],

            // ═══ Safari — Amboseli bucket (8 more; 9 with the original) ═══
            ['data' => ['title' => 'Amboseli & Kilimanjaro View Safari', 'category' => 'Safari', 'location' => 'Amboseli, Kenya', 'description' => 'Game drives beneath uninterrupted views of Mount Kilimanjaro across the Amboseli plains.', 'price' => 31000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 10, 'cancellation_policy' => 'moderate', 'amenities' => ['Hotel pickup', 'All meals', 'Professional guide'], 'views' => 380]],
            ['data' => ['title' => 'Amboseli Day Trip Safari', 'category' => 'Safari', 'location' => 'Kajiado County, Kenya', 'description' => 'A compact single-day safari from Nairobi, ideal for travellers short on time.', 'price' => 15000, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 12, 'cancellation_policy' => 'flexible', 'amenities' => ['Park fees included', 'Local guide', 'Bottled water'], 'views' => 720]],
            ['data' => ['title' => 'Amboseli Sunset Photography Safari', 'category' => 'Safari', 'location' => 'Amboseli, Kenya', 'description' => 'Late-afternoon safari timed for golden-hour elephant herds against the Kilimanjaro backdrop.', 'price' => 27000, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 6, 'cancellation_policy' => 'moderate', 'amenities' => ['Professional guide', 'Sunroof vehicle'], 'views' => 240]],
            ['data' => ['title' => 'Amboseli Maasai Village & Game Drive', 'category' => 'Safari', 'location' => 'Kajiado County, Kenya', 'description' => 'Morning game drive followed by a guided visit to a nearby Maasai homestead.', 'price' => 24000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 12, 'cancellation_policy' => 'flexible', 'amenities' => ['Hotel pickup', 'Local guide', 'Bottled water'], 'views' => 205]],
            ['data' => ['title' => 'Amboseli Budget Camping Safari', 'category' => 'Safari', 'location' => 'Amboseli, Kenya', 'description' => 'Budget-friendly camping safari with communal tented sites and all park fees included.', 'price' => 18000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 14, 'cancellation_policy' => 'flexible', 'amenities' => ['Park fees included', 'Local guide', 'Bottled water'], 'views' => 460]],
            ['data' => ['title' => 'Amboseli Luxury Lodge Safari', 'category' => 'Safari', 'location' => 'Amboseli, Kenya', 'description' => 'Stay in a premium lodge with private verandas overlooking Amboseli\'s swamps and elephant herds.', 'price' => 72000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 8, 'cancellation_policy' => 'strict', 'amenities' => ['All meals', 'Professional guide', 'Private vehicle'], 'views' => 150]],
            ['data' => ['title' => 'Amboseli Two-Night Explorer Safari', 'category' => 'Safari', 'location' => 'Kajiado County, Kenya', 'description' => 'Two full days of game drives with an overnight stay inside the park boundary.', 'price' => 34000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 10, 'cancellation_policy' => 'moderate', 'amenities' => ['Hotel pickup', 'All meals', 'Professional guide'], 'views' => 310]],
            ['data' => ['title' => 'Amboseli Big Tusker Safari', 'category' => 'Safari', 'location' => 'Amboseli, Kenya', 'description' => 'Track Amboseli\'s famous big-tusker elephants with a specialist elephant-research guide.', 'price' => 29500, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 8, 'cancellation_policy' => 'moderate', 'amenities' => ['Professional guide', 'Binoculars provided'], 'views' => 195]],

            // ═══ Safari — other destinations (unchanged from before) ═══
            ['data' => ['title' => 'Tsavo Red Elephants Safari', 'category' => 'Safari', 'location' => 'Tsavo East, Kenya', 'description' => '3-day safari through Tsavo\'s red-earth plains, famous for its dust-red elephant herds and volcanic landscapes.', 'price' => 38000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 10, 'cancellation_policy' => 'moderate', 'amenities' => ['Hotel pickup', 'All meals', 'Professional guide', 'Sunroof vehicle'], 'lat' => -2.9925, 'lng' => 38.4770, 'views' => 410]],
            ['data' => ['title' => 'Samburu Special Five Safari', 'category' => 'Safari', 'location' => 'Samburu County, Kenya', 'description' => 'Track the "Special Five" — Grevy\'s zebra, reticulated giraffe, Somali ostrich, gerenuk and Beisa oryx — found only in Kenya\'s north.', 'price' => 52000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 8, 'cancellation_policy' => 'strict', 'amenities' => ['All meals', 'Professional guide', 'Binoculars provided', 'Night drive option'], 'lat' => 0.5988, 'lng' => 37.5348, 'views' => 275]],
            ['data' => ['title' => 'Lake Nakuru Flamingo Safari', 'category' => 'Safari', 'location' => 'Lake Nakuru, Kenya', 'description' => 'A day trip to see thousands of flamingos and Nakuru\'s thriving rhino sanctuary.', 'price' => 19500, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 15, 'cancellation_policy' => 'flexible', 'amenities' => ['Park fees included', 'Local guide', 'Bottled water'], 'lat' => -0.3667, 'lng' => 36.0833, 'views' => 690]],

            // ═══ Stays — Popular stays in Nairobi (8 more; 9 with Westlands) ═══
            ['data' => ['title' => 'Ocean View Villa', 'category' => 'Stays', 'location' => 'Diani Beach, Kenya', 'description' => 'Beachfront villa with a private pool and direct beach access. Perfect for families or groups seeking a luxury coastal retreat.', 'price' => 32000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 8, 'bedrooms' => 3, 'beds' => 4, 'bathrooms' => 2, 'cancellation_policy' => 'moderate', 'amenities' => ['Private pool', 'Beachfront access', 'WiFi', 'Air conditioning', 'Full kitchen'], 'lat' => -4.2833, 'lng' => 39.5833, 'views' => 520]],
            ['data' => ['title' => 'Cosy Westlands Apartment', 'category' => 'Stays', 'location' => 'Westlands, Nairobi', 'description' => 'A light-filled apartment in the heart of Westlands. Walking distance to restaurants, cafes and the CBD.', 'price' => 9500, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 3, 'bedrooms' => 1, 'beds' => 1, 'bathrooms' => 1, 'cancellation_policy' => 'flexible', 'amenities' => ['High-speed WiFi', 'Air conditioning', 'Smart TV', 'Full kitchen', 'Free parking'], 'lat' => -1.2637, 'lng' => 36.8030, 'views' => 380]],
            ['data' => ['title' => 'Kilimani Modern Loft', 'category' => 'Stays', 'location' => 'Kilimani, Nairobi', 'description' => 'A stylish modern loft close to Yaya Centre, with fast WiFi and a dedicated workspace.', 'price' => 8500, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 3, 'bedrooms' => 1, 'beds' => 1, 'bathrooms' => 1, 'cancellation_policy' => 'flexible', 'amenities' => ['WiFi', 'Air conditioning', 'Full kitchen'], 'views' => 340]],
            ['data' => ['title' => 'Lavington Garden Cottage', 'category' => 'Stays', 'location' => 'Lavington, Nairobi', 'description' => 'A quiet garden cottage tucked away in leafy Lavington, minutes from top restaurants.', 'price' => 12500, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 4, 'bedrooms' => 2, 'beds' => 2, 'bathrooms' => 2, 'cancellation_policy' => 'moderate', 'amenities' => ['WiFi', 'Free parking', 'Hot water'], 'views' => 260]],
            ['data' => ['title' => 'Kileleshwa Serviced Apartment', 'category' => 'Stays', 'location' => 'Kileleshwa, Nairobi', 'description' => 'Fully serviced apartment with daily housekeeping, ideal for business travellers.', 'price' => 9800, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 2, 'bedrooms' => 1, 'beds' => 1, 'bathrooms' => 1, 'cancellation_policy' => 'flexible', 'amenities' => ['WiFi', 'Air conditioning', 'Housekeeping'], 'views' => 195]],
            ['data' => ['title' => 'Upper Hill Executive Suite', 'category' => 'Stays', 'location' => 'Upper Hill, Nairobi', 'description' => 'Executive suite steps from Nairobi\'s business district, with skyline views.', 'price' => 13500, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 2, 'bedrooms' => 1, 'beds' => 1, 'bathrooms' => 1, 'cancellation_policy' => 'moderate', 'amenities' => ['WiFi', 'Air conditioning', 'Smart TV'], 'views' => 175]],
            ['data' => ['title' => 'Muthaiga Family House', 'category' => 'Stays', 'location' => 'Muthaiga, Nairobi', 'description' => 'A spacious family house with a private garden in one of Nairobi\'s most established neighbourhoods.', 'price' => 22000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 8, 'bedrooms' => 4, 'beds' => 5, 'bathrooms' => 3, 'cancellation_policy' => 'moderate', 'amenities' => ['WiFi', 'Free parking', 'Full kitchen', 'Garden'], 'views' => 145]],
            ['data' => ['title' => 'Parklands Cosy Studio', 'category' => 'Stays', 'location' => 'Parklands, Nairobi', 'description' => 'A compact, budget-friendly studio close to Parklands\' cafes and shops.', 'price' => 6500, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 2, 'bedrooms' => 1, 'beds' => 1, 'bathrooms' => 1, 'cancellation_policy' => 'flexible', 'amenities' => ['WiFi', 'Hot water'], 'views' => 410]],
            ['data' => ['title' => 'Runda Luxury Villa', 'category' => 'Stays', 'location' => 'Runda, Nairobi', 'description' => 'An expansive luxury villa in Runda with mature gardens and staff quarters.', 'price' => 28000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 10, 'bedrooms' => 5, 'beds' => 6, 'bathrooms' => 4, 'cancellation_policy' => 'strict', 'amenities' => ['Private pool', 'WiFi', 'Free parking', 'Full kitchen', 'Garden'], 'views' => 130]],
            ['data' => ['title' => 'Gigiri Diplomat\'s Apartment', 'category' => 'Stays', 'location' => 'Gigiri, Nairobi', 'description' => 'A secure, well-appointed apartment near the UN complex in Gigiri.', 'price' => 16000, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 4, 'bedrooms' => 2, 'beds' => 2, 'bathrooms' => 2, 'cancellation_policy' => 'moderate', 'amenities' => ['WiFi', 'Air conditioning', 'Free parking'], 'views' => 160]],

            // ═══ Stays — Beachfront villas in Kenya (8 more; 9 with Ocean View Villa) ═══
            ['data' => ['title' => 'Malindi Beachfront Bungalow', 'category' => 'Stays', 'location' => 'Malindi, Kenya', 'description' => 'A charming bungalow steps from Malindi\'s white-sand beach, with a shaded veranda.', 'price' => 15000, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 4, 'bedrooms' => 2, 'beds' => 2, 'bathrooms' => 1, 'cancellation_policy' => 'moderate', 'amenities' => ['Beach access', 'WiFi', 'Hot water'], 'views' => 220]],
            ['data' => ['title' => 'Mombasa Old Town Boutique Stay', 'category' => 'Stays', 'location' => 'Mombasa, Kenya', 'description' => 'A boutique stay inside a restored Swahili house in historic Old Town Mombasa.', 'price' => 9500, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 2, 'bedrooms' => 1, 'beds' => 1, 'bathrooms' => 1, 'cancellation_policy' => 'flexible', 'amenities' => ['WiFi', 'Air conditioning'], 'views' => 265]],
            ['data' => ['title' => 'Diani Palm Beach Cottage', 'category' => 'Stays', 'location' => 'Diani Beach, Kenya', 'description' => 'A palm-shaded cottage a short walk from Diani\'s main beach strip.', 'price' => 13500, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 4, 'bedrooms' => 2, 'beds' => 2, 'bathrooms' => 2, 'cancellation_policy' => 'moderate', 'amenities' => ['Beach access', 'WiFi', 'Free parking'], 'views' => 300]],
            ['data' => ['title' => 'Nyali Beach Apartment', 'category' => 'Stays', 'location' => 'Mombasa, Kenya', 'description' => 'A modern apartment in Nyali with easy access to the beach and shopping malls.', 'price' => 11000, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 4, 'bedrooms' => 2, 'beds' => 2, 'bathrooms' => 1, 'cancellation_policy' => 'flexible', 'amenities' => ['WiFi', 'Air conditioning', 'Full kitchen'], 'views' => 240]],
            ['data' => ['title' => 'Diani Beachfront Penthouse', 'category' => 'Stays', 'location' => 'Diani Beach, Kenya', 'description' => 'A top-floor penthouse with panoramic ocean views and a wraparound balcony.', 'price' => 35000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 6, 'bedrooms' => 3, 'beds' => 3, 'bathrooms' => 3, 'cancellation_policy' => 'strict', 'amenities' => ['Private pool', 'Beachfront access', 'WiFi', 'Air conditioning'], 'views' => 190]],
            ['data' => ['title' => 'Malindi Seaview Cottage', 'category' => 'Stays', 'location' => 'Malindi, Kenya', 'description' => 'A tranquil seaview cottage with a private garden and outdoor dining area.', 'price' => 12500, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 4, 'bedrooms' => 2, 'beds' => 2, 'bathrooms' => 1, 'cancellation_policy' => 'moderate', 'amenities' => ['Beach access', 'WiFi', 'Hot water'], 'views' => 175]],
            ['data' => ['title' => 'Mombasa Beach Family Villa', 'category' => 'Stays', 'location' => 'Mombasa, Kenya', 'description' => 'A large family villa with a private pool, minutes from Nyali Beach.', 'price' => 26000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 8, 'bedrooms' => 4, 'beds' => 5, 'bathrooms' => 3, 'cancellation_policy' => 'moderate', 'amenities' => ['Private pool', 'WiFi', 'Full kitchen', 'Free parking'], 'views' => 155]],
            ['data' => ['title' => 'Diani Honeymoon Beach Suite', 'category' => 'Stays', 'location' => 'Diani Beach, Kenya', 'description' => 'An intimate beachfront suite designed for couples, with a private plunge pool.', 'price' => 19500, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 2, 'bedrooms' => 1, 'beds' => 1, 'bathrooms' => 1, 'cancellation_policy' => 'strict', 'amenities' => ['Private pool', 'Beachfront access', 'WiFi'], 'views' => 210]],

            // ═══ Stays — Lakeside & nature retreats (9; none existed before) ═══
            ['data' => ['title' => 'Naivasha Lakeview Cottage', 'category' => 'Stays', 'location' => 'Lake Naivasha, Kenya', 'description' => 'A cottage overlooking Lake Naivasha with resident giraffes often grazing nearby.', 'price' => 10500, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 4, 'bedrooms' => 2, 'beds' => 2, 'bathrooms' => 1, 'cancellation_policy' => 'moderate', 'amenities' => ['WiFi', 'Free parking', 'Garden'], 'views' => 230]],
            ['data' => ['title' => 'Naivasha Farmhouse Retreat', 'category' => 'Stays', 'location' => 'Lake Naivasha, Kenya', 'description' => 'A converted farmhouse on a working flower farm, with easy access to Hell\'s Gate.', 'price' => 14000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 6, 'bedrooms' => 3, 'beds' => 3, 'bathrooms' => 2, 'cancellation_policy' => 'moderate', 'amenities' => ['WiFi', 'Free parking', 'Full kitchen'], 'views' => 165]],
            ['data' => ['title' => 'Kisumu Lakeside Bungalow', 'category' => 'Stays', 'location' => 'Kisumu, Kenya', 'description' => 'A bungalow on the shores of Lake Victoria, close to Kisumu\'s waterfront markets.', 'price' => 8500, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 4, 'bedrooms' => 2, 'beds' => 2, 'bathrooms' => 1, 'cancellation_policy' => 'flexible', 'amenities' => ['WiFi', 'Hot water'], 'views' => 140]],
            ['data' => ['title' => 'Karen Garden Cottage', 'category' => 'Stays', 'location' => 'Karen, Nairobi', 'description' => 'A leafy cottage in Karen with a large private garden, close to the Karen Blixen Museum.', 'price' => 18000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 6, 'bedrooms' => 3, 'beds' => 3, 'bathrooms' => 2, 'cancellation_policy' => 'moderate', 'amenities' => ['WiFi', 'Free parking', 'Garden'], 'views' => 200]],
            ['data' => ['title' => 'Karen Forest Retreat', 'category' => 'Stays', 'location' => 'Karen, Nairobi', 'description' => 'A secluded retreat bordering Ngong Road Forest, with a wraparound veranda.', 'price' => 21000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 8, 'bedrooms' => 4, 'beds' => 4, 'bathrooms' => 3, 'cancellation_policy' => 'strict', 'amenities' => ['WiFi', 'Free parking', 'Full kitchen', 'Garden'], 'views' => 135]],
            ['data' => ['title' => 'Naivasha Hippo Point Cottage', 'category' => 'Stays', 'location' => 'Lake Naivasha, Kenya', 'description' => 'A lakefront cottage near Hippo Point, popular with birdwatchers and photographers.', 'price' => 12000, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 4, 'bedrooms' => 2, 'beds' => 2, 'bathrooms' => 2, 'cancellation_policy' => 'moderate', 'amenities' => ['WiFi', 'Free parking'], 'views' => 180]],
            ['data' => ['title' => 'Kisumu Lake Victoria View Apartment', 'category' => 'Stays', 'location' => 'Kisumu, Kenya', 'description' => 'A modern apartment with sweeping views of Lake Victoria and Kisumu\'s skyline.', 'price' => 9000, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 2, 'bedrooms' => 1, 'beds' => 1, 'bathrooms' => 1, 'cancellation_policy' => 'flexible', 'amenities' => ['WiFi', 'Air conditioning'], 'views' => 110]],
            ['data' => ['title' => 'Naivasha Safari-Style Lodge Stay', 'category' => 'Stays', 'location' => 'Lake Naivasha, Kenya', 'description' => 'Canvas-and-timber lodge rooms set among acacia trees on the lake shore.', 'price' => 16500, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 4, 'bedrooms' => 2, 'beds' => 2, 'bathrooms' => 2, 'cancellation_policy' => 'moderate', 'amenities' => ['All meals', 'WiFi', 'Free parking'], 'views' => 150]],
            ['data' => ['title' => 'Kisumu City Lakeside Suite', 'category' => 'Stays', 'location' => 'Kisumu, Kenya', 'description' => 'A comfortable suite in central Kisumu, a short walk from the lakeside promenade.', 'price' => 7800, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 2, 'bedrooms' => 1, 'beds' => 1, 'bathrooms' => 1, 'cancellation_policy' => 'flexible', 'amenities' => ['WiFi', 'Hot water'], 'views' => 95]],

            // ═══ Stays — other (unchanged) ═══
            ['data' => ['title' => 'Lamu Seafront Cottage', 'category' => 'Stays', 'location' => 'Lamu, Kenya', 'description' => 'A tranquil Swahili-style cottage steps from the Indian Ocean, on the historic island of Lamu.', 'price' => 14000, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 4, 'bedrooms' => 2, 'beds' => 2, 'bathrooms' => 1, 'cancellation_policy' => 'moderate', 'amenities' => ['Beach access', 'Breakfast included', 'WiFi', 'Hot water'], 'lat' => -2.2717, 'lng' => 40.9020, 'views' => 205]],

            // ═══ Experiences (unchanged, image pool now guaranteed working) ═══
            ['data' => ['title' => 'Karen Blixen Coffee & Culture Tour', 'category' => 'Experiences', 'location' => 'Karen, Nairobi', 'description' => 'Visit the Karen Blixen Museum and a working coffee estate, with tastings and a traditional Kenyan lunch.', 'price' => 6500, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 10, 'cancellation_policy' => 'flexible', 'amenities' => ['Hotel pickup', 'Lunch included', 'Local guide'], 'views' => 320]],
            ['data' => ['title' => 'Diani Sunset Dhow Cruise', 'category' => 'Experiences', 'location' => 'Diani Beach, Kenya', 'description' => 'A traditional dhow sailing trip along the coast at sunset, with snorkelling and fresh seafood on board.', 'price' => 5200, 'status' => 'active', 'min_guests' => 1, 'max_guests' => 12, 'cancellation_policy' => 'moderate', 'amenities' => ['Snorkelling gear', 'Seafood dinner', 'Life jackets provided'], 'views' => 460]],

            // ═══ Packages — Curated packages (6 more; 9 with the original 3) ═══
            [
                'data' => ['title' => '5-Day Kenya Highlights', 'category' => 'Packages', 'location' => 'Nairobi + Maasai Mara, Kenya', 'description' => 'Nairobi city tour, Maasai Mara safari and a hot air balloon ride — all in one package. Full board, airport transfers and expert guides included.', 'price' => 85000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 10, 'cancellation_policy' => 'strict', 'amenities' => ['Return flight Nairobi → Maasai Mara', '4 nights full board', 'Airport transfers', '3 game drives', 'All meals included'], 'views' => 610],
                'itinerary' => [
                    ['day' => 1, 'title' => 'Nairobi city tour & transfer', 'description' => 'Pickup, city highlights, transfer to the Mara.'],
                    ['day' => 2, 'title' => 'Full-day Maasai Mara game drive', 'description' => 'Morning and evening game drives.'],
                    ['day' => 3, 'title' => 'Balloon safari & departure', 'description' => 'Sunrise balloon ride, breakfast, transfer back to Nairobi.'],
                ],
                'departures' => [now()->addDays(21), now()->addDays(35)],
            ],
            [
                'data' => ['title' => 'Coastal Escape Package', 'category' => 'Packages', 'location' => 'Mombasa + Diani, Kenya', 'description' => '4 nights beachfront accommodation, water sports, Haller Park visit and a Mombasa Old Town tour.', 'price' => 55000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 6, 'cancellation_policy' => 'moderate', 'amenities' => ['4 nights full board', 'Airport transfers', 'Water sports session', 'Old Town guided tour'], 'views' => 340],
                'itinerary' => [
                    ['day' => 1, 'title' => 'Arrival & beach afternoon', 'description' => 'Check-in and free time on the beach.'],
                    ['day' => 2, 'title' => 'Snorkelling & dhow cruise', 'description' => 'Reef snorkelling followed by a sunset dhow cruise.'],
                    ['day' => 3, 'title' => 'Spa day & departure', 'description' => 'Morning spa session, transfer to the airport.'],
                ],
                'departures' => [now()->addDays(28)],
            ],
            [
                'data' => ['title' => 'Rift Valley Adventure Package', 'category' => 'Packages', 'location' => 'Lake Naivasha + Lake Nakuru, Kenya', 'description' => 'Boat rides among hippos on Lake Naivasha, a walking safari at Hell\'s Gate, and flamingos at Lake Nakuru.', 'price' => 42000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 12, 'cancellation_policy' => 'flexible', 'amenities' => ['3 nights full board', 'Boat ride included', 'Park fees included', 'Cycling equipment'], 'views' => 275],
                'itinerary' => [
                    ['day' => 1, 'title' => 'Naivasha boat ride', 'description' => 'Hippo and bird-watching boat safari.'],
                    ['day' => 2, 'title' => "Hell's Gate walking safari", 'description' => 'Guided walk and optional cycling through the gorge.'],
                    ['day' => 3, 'title' => 'Lake Nakuru & departure', 'description' => 'Morning game drive, transfer back to Nairobi.'],
                ],
                'departures' => [now()->addDays(12), now()->addDays(26)],
            ],
            [
                'data' => ['title' => '7-Day Grand Kenya Safari & Beach Package', 'category' => 'Packages', 'location' => 'Maasai Mara + Diani, Kenya', 'description' => 'A full week combining Maasai Mara game drives with a relaxing beach finish in Diani.', 'price' => 145000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 8, 'cancellation_policy' => 'strict', 'amenities' => ['6 nights full board', 'Domestic flight included', 'Airport transfers', 'All meals included'], 'views' => 195],
                'itinerary' => [
                    ['day' => 1, 'title' => 'Arrival & transfer to the Mara', 'description' => 'Pickup from JKIA, flight to Maasai Mara.'],
                    ['day' => 2, 'title' => 'Full-day game drives', 'description' => 'Morning and evening safari drives in the Mara.'],
                    ['day' => 3, 'title' => 'Fly to the coast', 'description' => 'Transfer flight to Diani, check-in and beach afternoon.'],
                    ['day' => 4, 'title' => 'Beach & watersports', 'description' => 'Free day with optional snorkelling and dhow cruise.'],
                ],
                'departures' => [now()->addDays(30), now()->addDays(50)],
            ],
            [
                'data' => ['title' => 'Northern Kenya Explorer Package', 'category' => 'Packages', 'location' => 'Samburu + Lake Turkana, Kenya', 'description' => 'An off-the-beaten-path expedition through Samburu\'s special wildlife and the shores of Lake Turkana.', 'price' => 98000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 10, 'cancellation_policy' => 'strict', 'amenities' => ['5 nights full board', '4x4 expedition vehicle', 'Professional guide', 'All meals included'], 'views' => 110],
                'itinerary' => [
                    ['day' => 1, 'title' => 'Nairobi to Samburu', 'description' => 'Scenic drive north, afternoon game drive.'],
                    ['day' => 2, 'title' => 'Samburu Special Five tracking', 'description' => 'Full day tracking Samburu\'s signature species.'],
                    ['day' => 3, 'title' => 'Onward to Lake Turkana', 'description' => 'Drive to the Jade Sea, evening at the lakeshore.'],
                ],
                'departures' => [now()->addDays(40)],
            ],
            [
                'data' => ['title' => 'Nairobi City & Amboseli Weekend Package', 'category' => 'Packages', 'location' => 'Nairobi + Amboseli, Kenya', 'description' => 'A short weekend package combining Nairobi city highlights with an Amboseli game drive.', 'price' => 38000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 12, 'cancellation_policy' => 'flexible', 'amenities' => ['2 nights full board', 'Airport transfers', 'City tour included'], 'views' => 265],
                'itinerary' => [
                    ['day' => 1, 'title' => 'Nairobi city tour', 'description' => 'Museum, market and city highlights, transfer to Amboseli.'],
                    ['day' => 2, 'title' => 'Amboseli game drive & departure', 'description' => 'Morning game drive, return transfer to Nairobi.'],
                ],
                'departures' => [now()->addDays(15), now()->addDays(22)],
            ],
            [
                'data' => ['title' => 'Kenya Family Adventure Package', 'category' => 'Packages', 'location' => 'Nairobi + Naivasha + Maasai Mara, Kenya', 'description' => 'A family-paced itinerary mixing Naivasha boat rides with a gentle Maasai Mara safari.', 'price' => 110000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 10, 'cancellation_policy' => 'moderate', 'amenities' => ['4 nights full board', 'Airport transfers', 'Kid-friendly guides', 'All meals included'], 'views' => 175],
                'itinerary' => [
                    ['day' => 1, 'title' => 'Naivasha boat ride', 'description' => 'Hippo and bird-watching boat safari.'],
                    ['day' => 2, 'title' => 'Transfer to the Mara', 'description' => 'Scenic drive, afternoon game drive.'],
                    ['day' => 3, 'title' => 'Family safari day', 'description' => 'Shorter, kid-paced game drives with picnic lunch.'],
                ],
                'departures' => [now()->addDays(25)],
            ],
            [
                'data' => ['title' => 'Luxury Kenya Honeymoon Package', 'category' => 'Packages', 'location' => 'Maasai Mara + Diani, Kenya', 'description' => 'A premium honeymoon itinerary pairing a private Mara safari with a beachfront suite in Diani.', 'price' => 175000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 2, 'cancellation_policy' => 'strict', 'amenities' => ['5 nights full board', 'Private vehicle', 'Domestic flight included', 'Champagne welcome'], 'views' => 90],
                'itinerary' => [
                    ['day' => 1, 'title' => 'Arrival & private safari camp', 'description' => 'Fly to the Mara, check into a private luxury camp.'],
                    ['day' => 2, 'title' => 'Private game drives', 'description' => 'Exclusive-use vehicle and guide for the day.'],
                    ['day' => 3, 'title' => 'Fly to the coast', 'description' => 'Transfer to a beachfront honeymoon suite in Diani.'],
                ],
                'departures' => [now()->addDays(45)],
            ],
            [
                'data' => ['title' => 'Budget Backpacker Kenya Package', 'category' => 'Packages', 'location' => 'Nairobi + Lake Nakuru + Maasai Mara, Kenya', 'description' => 'An affordable, hostel-and-camping-based route through Kenya\'s highlights for budget travellers.', 'price' => 36000, 'status' => 'active', 'min_guests' => 2, 'max_guests' => 16, 'cancellation_policy' => 'flexible', 'amenities' => ['3 nights camping', 'Group transport', 'Park fees included'], 'views' => 385],
                'itinerary' => [
                    ['day' => 1, 'title' => 'Nairobi to Lake Nakuru', 'description' => 'Group transfer, afternoon game drive.'],
                    ['day' => 2, 'title' => 'Onward to the Mara', 'description' => 'Scenic drive, evening at a budget campsite.'],
                    ['day' => 3, 'title' => 'Maasai Mara game drive & departure', 'description' => 'Full-day game drive, return to Nairobi.'],
                ],
                'departures' => [now()->addDays(10), now()->addDays(20)],
            ],
        ];

        foreach ($more as $seed => $entry) {
            $listing = $vendor->listings()->create($entry['data']);
            $this->attachImages($listing, $entry['data']['category'], $seed + 100);

            foreach ($entry['itinerary'] ?? [] as $day) {
                $listing->itinerary()->create($day);
            }

            foreach ($entry['departures'] ?? [] as $date) {
                $listing->departures()->create([
                    'date' => $date,
                    'capacity' => rand(6, 12),
                    'booked' => 0,
                ]);
            }
        }
    }

    private function attachImages(Listing $listing, string $category, int $seed, int $count = 5): void
    {
        $pool = match ($category) {
            'Safari' => self::SAFARI_IMAGES,
            'Stays' => self::STAYS_IMAGES,
            'Packages' => self::PACKAGES_IMAGES,
            default => self::EXPERIENCES_IMAGES,
        };

        $n = count($pool);
        for ($i = 0; $i < $count; $i++) {
            $listing->images()->create([
                'url' => $pool[($seed + $i) % $n],
                'position' => $i,
            ]);
        }
    }
}
