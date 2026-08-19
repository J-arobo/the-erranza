<?php

namespace App\Services;

use App\Models\Message;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SupportMessenger
{
    public static function supportUser(): User
    {
        return User::firstOrCreate(
            ['email' => 'support@erranza.co.ke'],
            [
                'name' => 'Erranza Support',
                'password' => Hash::make(Str::random(40)),
            ]
        );
    }

    public static function sendToVendor(Vendor $vendor, string $text): Message
    {
        $support = self::supportUser();

        return Message::create([
            'vendor_id' => $vendor->id,
            'traveller_id' => $support->id,
            'sender_type' => 'guest',
            'sender_id' => $support->id,
            'text' => $text,
        ]);
    }
    // Traveller
    public static function supportVendor(): Vendor
    {
        $user = self::supportUser();

        return Vendor::firstOrCreate(
            ['user_id' => $user->id],
            [
                'business_name' => 'Erranza Support',
                'email' => $user->email,
                'verification_status' => 'approved',
                'onboarding_complete' => true,
            ]
        );
    }

    public static function sendToTraveller(User $traveller, string $text, ?int $listingId = null): Message
    {
        $vendor = self::supportVendor();
        $support = self::supportUser();

        return Message::create([
            'vendor_id' => $vendor->id,
            'listing_id' => $listingId,
            'traveller_id' => $traveller->id,
            'sender_type' => 'vendor',
            'sender_id' => $support->id,
            'text' => $text,
        ]);
    }
}
