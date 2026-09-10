<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PlatformPayoutSettledMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $businessName,
        public int $bookingId,
        public string $listingTitle,
        public string $travellerName,
        public float $vendorNet,
        public float $commission,
        public ?string $reference,
        public ?string $destination,
    ) {}

    public function build()
    {
        return $this->subject("Payout settled — booking #{$this->bookingId} ({$this->businessName})")
            ->view('emails.platform-payout-settled');
    }
}
