<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

            return "{$frontendUrl}/reset-password?token={$token}&email=" . urlencode($notifiable->getEmailForPasswordReset());
        });
    }
}
