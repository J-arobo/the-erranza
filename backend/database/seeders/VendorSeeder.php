<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class VendorSeeder extends Seeder
{
    public function run(): void
    {
        $owner = User::firstOrCreate(
            ['email' => 'sarah@maraexpeditions.co.ke'],
            [
                'name' => 'Sarah Wanjiru',
                'password' => Hash::make('password'),
                'active_role' => 'partner',
            ]
        );

        $partnerRole = Role::where('name', 'partner')->first();
        $owner->roles()->syncWithoutDetaching($partnerRole);

        $vendor = Vendor::firstOrCreate(
            ['user_id' => $owner->id],
            [
                'business_name' => 'Mara Expeditions',
                'email' => 'info@maraexpeditions.co.ke',
                'phone' => '+254 712 345 678',
                'bio' => 'Local tour operator sharing the best of Kenya with every guest.',
                'verification_status' => 'approved',
                'suspended' => false,
                'onboarding_complete' => true,
                'categories' => ['Safari', 'Experiences'],
                'plan' => 'standard',
                'default_cancellation_policy' => 'moderate',
            ]
        );

        $vendor->forceFill(['created_at' => now()->subYears(3)])->save();

    }
}