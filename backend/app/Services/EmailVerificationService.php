<?php

namespace App\Services;

use App\Mail\EmailVerificationLinkMail;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class EmailVerificationService
{
    // One confirmation link per user at a time, reused for two purposes
    // depending on whether pending_email is set: confirming their own
    // (just-registered) address when null, or confirming a requested email
    // change when set. Issuing a new link invalidates any previous one.
    // (Stored in the email_verification_code column — now a link token, not a code.)
    public static function issueLink(User $user, ?string $targetEmail = null): void
    {
        $token = Str::random(48);

        $user->forceFill([
            'pending_email' => $targetEmail,
            'email_verification_code' => $token,
            'email_verification_code_expires_at' => now()->addMinutes(60),
        ])->save();

        $url = rtrim(config('app.frontend_url'), '/') . "/verify-email/{$token}";

        defer(function () use ($user, $targetEmail, $url) {
            try {
                Mail::to($targetEmail ?? $user->email)->send(new EmailVerificationLinkMail($url, $user->name));
            } catch (\Throwable $e) {
                Log::error('Failed to send email verification link', ['error' => $e->getMessage()]);
            }
        });

    }

    /**
     * Consumes the token. Returns null if unknown/expired, otherwise
     * ['user' => User, 'changed' => bool, 'email' => string].
     */
    public static function verifyByToken(string $token): ?array
    {
        if (strlen($token) < 20) {
            return null;
        }

        $user = User::where('email_verification_code', $token)->first();

        if (!$user || !$user->email_verification_code_expires_at || $user->email_verification_code_expires_at->isPast()) {
            return null;
        }

        $oldEmail = $user->email;
        $wasChange = $user->pending_email !== null && $user->pending_email !== $oldEmail;

        $user->forceFill([
            'email' => $user->pending_email ?? $user->email,
            'email_verified_at' => now(),
            'pending_email' => null,
        ])->save();

        if ($wasChange) {
            defer(function () use ($oldEmail, $user) {
                try {
                    Mail::to($oldEmail)->send(new \App\Mail\AccountSecurityAlertMail(
                        'Your login email was changed',
                        "Your Erranza login email was changed to {$user->email}. If this wasn't you, contact support immediately.",
                    ));
                } catch (\Throwable $e) {
                    Log::error('Failed to send email-change alert', ['error' => $e->getMessage()]);
                }
            });
        }

        return ['user' => $user, 'changed' => $wasChange, 'email' => $user->email];
    }

}
