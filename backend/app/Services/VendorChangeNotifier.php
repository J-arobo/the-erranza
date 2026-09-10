<?php

namespace App\Services;

use App\Models\Vendor;

class VendorChangeNotifier
{
    // Fires whenever something on a vendor's account or a listing changes —
    // posts into the vendor's own Messages inbox (from Erranza Support) and
    // the notification bell, both carrying a "wasn't you? contact support"
    // line, so a vendor has a real trail of who changed what and when.
    public static function notify(Vendor $vendor, string $subject, array $changes = []): void
    {
        $changeText = count($changes) > 0 ? implode(', ', $changes) : null;

        $message = $changeText
            ? "{$subject}: {$changeText}. If this wasn't you, please contact support immediately."
            : "{$subject}. If this wasn't you, please contact support immediately.";

        $vendor->notifications()->create([
            'type' => 'system',
            'title' => $subject,
            'message' => $message,
            'link' => '/vendor/profile',
        ]);

        SupportMessenger::sendToVendor($vendor, $message);
    }
}
