<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\BookingExtraCharge;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ExtraChargeRequestedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public BookingExtraCharge $charge, public Booking $booking) {}

    public function build()
    {
        return $this->subject('Your host has requested an extra charge')
            ->view('emails.extra-charge-requested');
    }
}