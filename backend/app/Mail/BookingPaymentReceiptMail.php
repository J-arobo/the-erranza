<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BookingPaymentReceiptMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Booking $booking, public ?string $reference = null) {}

    public function build()
    {
        return $this->subject('Payment received — Erranza')
            ->view('emails.booking-payment-receipt', ['reference' => $this->reference]);
    }
}
