<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EmailVerificationLinkMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $url, public string $userName) {}

    public function build()
    {
        return $this->subject('Confirm your email — Erranza')
            ->view('emails.email-verification-link');
    }
}
