<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VendorPayoutPaidMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $businessName,
        public float $amount,
        public string $listingTitle,
        public ?string $reference,
        public ?string $destination,
    ) {}

    public function build()
    {
        return $this->subject('You\'ve been paid — Erranza')
            ->view('emails.vendor-payout-paid');
    }
}