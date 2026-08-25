<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VendorBookingRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Booking $booking, public string $acceptLink) {}

    public function build()
    {
        return $this->subject('New paid booking request — action needed')
            ->view('emails.vendor-booking-request', ['acceptLink' => $this->acceptLink]);
    }
}
