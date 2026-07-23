<?php

namespace Database\Seeders;

use App\Models\PlatformConfig;
use Illuminate\Database\Seeder;

class PlatformConfigSeeder extends Seeder
{
    public function run(): void
    {
        PlatformConfig::firstOrCreate(['id' => 1], [
            'commission_standard' => 12,
            'commission_plus' => 8,
            'plus_price_monthly' => 2500,
            'default_cancellation_policy' => 'moderate',
            'dispute_ceiling' => 20000,
            'maintenance_mode' => false,
            'maintenance_message' => null,
        ]);
    }
}
