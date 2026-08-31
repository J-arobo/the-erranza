<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TripCompletionCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Booking $booking, public string $code) {}

    public function build()
    {
        return $this->subject('Your trip completion code')
            ->view('emails.trip-completion-code', ['code' => $this->code]);
    }
}
