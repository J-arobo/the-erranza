<?php

namespace App\Services;

use App\Mail\BookingConfirmedMail;
use App\Models\Booking;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class BookingNotifier
{
    public static function notifyPaid(Booking $booking): void
    {
        $booking->loadMissing('listing.vendor', 'traveller');

        $booking->listing->vendor->notifications()->create([
            'type' => 'booking',
            'title' => 'New booking',
            'message' => "A booking for \"{$booking->listing->title}\" has been paid and confirmed.",
            'link' => "/vendor/bookings/{$booking->id}",
        ]);

        $email = $booking->billing_email ?? $booking->traveller->email;
        try {
            Mail::to($email)->send(new BookingConfirmedMail($booking));
        } catch (\Throwable $e) {
            Log::error('Failed to send booking confirmation email', ['error' => $e->getMessage()]);
        }
    }
}
