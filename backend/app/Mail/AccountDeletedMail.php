<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AccountDeletedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $name) {}

    public function build()
    {
        return $this->subject('Your Erranza account has been closed')
            ->view('emails.account-deleted');
    }
}
