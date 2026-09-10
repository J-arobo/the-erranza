<?php

namespace App\Mail;

use App\Models\VendorTeamMember;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TeamInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public VendorTeamMember $member, public string $acceptLink) {}

    public function build()
    {
        return $this->subject("You've been invited to join {$this->member->vendor->business_name} on Erranza")
            ->view('emails.team-invite');
    }
}
