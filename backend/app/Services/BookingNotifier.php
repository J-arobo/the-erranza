<?php

namespace App\Services;

use App\Mail\BookingPaymentReceiptMail;
use App\Mail\VendorBookingRequestMail;
use App\Models\Booking;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class BookingNotifier
{
    // Fires once a payment actually clears — not once the vendor accepts. It
    // sends the payment receipt (not a "you're confirmed" email, since the
    // vendor still has to accept the request) and asks the vendor to review
    // it. A separate, later notifyConfirmed() covers the vendor's acceptance.
    public static function notifyPaid(Booking $booking): void
    {
        $booking->loadMissing('listing.vendor', 'traveller', 'payments');

        $booking->listing->vendor->notifications()->create([
            'type' => 'booking',
            'title' => 'New booking request',
            'message' => "A booking for \"{$booking->listing->title}\" has been paid — review and accept it.",
            'link' => "/vendor/bookings/{$booking->id}",
        ]);

        $reference = $booking->payments->last()?->paystack_reference;
        $travellerEmail = $booking->billing_email ?? $booking->traveller->email;
        try {
            Mail::to($travellerEmail)->send(new BookingPaymentReceiptMail($booking, $reference));
        } catch (\Throwable $e) {
            Log::error('Failed to send payment receipt email', ['error' => $e->getMessage()]);
        }

        $acceptLink = rtrim(config('app.frontend_url'), '/') . "/vendor/bookings/{$booking->id}";
        try {
            Mail::to($booking->listing->vendor->email)->send(new VendorBookingRequestMail($booking, $acceptLink));
        } catch (\Throwable $e) {
            Log::error('Failed to send vendor booking request email', ['error' => $e->getMessage()]);
        }

        try {
            SupportMessenger::sendBookingNotice(
                $booking->traveller,
                "Payment received for \"{$booking->listing->title}\" — Ksh " . number_format($booking->total, 0) . ". Waiting on the host to confirm your booking.",
                $booking->listing_id
            );
        } catch (\Throwable $e) {
            Log::error('Failed to post booking notice message', ['error' => $e->getMessage()]);
        }
    }

    // Fires when the vendor accepts a pending booking — this is the actual
    // "your trip is confirmed" moment, distinct from the payment receipt above.
    public static function notifyConfirmed(Booking $booking): void
    {
        $booking->loadMissing('listing', 'traveller');

        $email = $booking->billing_email ?? $booking->traveller->email;
        try {
            Mail::to($email)->send(new \App\Mail\BookingConfirmedMail($booking));
        } catch (\Throwable $e) {
            Log::error('Failed to send booking confirmed email', ['error' => $e->getMessage()]);
        }

        try {
            SupportMessenger::sendBookingNotice(
                $booking->traveller,
                "Your host confirmed \"{$booking->listing->title}\"! Your booking is now confirmed.",
                $booking->listing_id
            );
        } catch (\Throwable $e) {
            Log::error('Failed to post booking notice message', ['error' => $e->getMessage()]);
        }
    }
}
