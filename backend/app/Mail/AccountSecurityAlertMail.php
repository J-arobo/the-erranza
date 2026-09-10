<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AccountSecurityAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $alertSubject, public string $detail) {}

    public function build()
    {
        return $this->subject($this->alertSubject)
            ->view('emails.account-security-alert');
    }
}
