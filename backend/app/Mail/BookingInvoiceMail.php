<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BookingInvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Booking $booking, public string $paymentLink) {}

    public function build()
    {
        return $this->subject('Your Erranza trip — payment required')
            ->view('emails.booking-invoice');
    }
}
