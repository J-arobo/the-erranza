<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    // Everyone who already had an account before email verification existed
    // is grandfathered in — the gate only ever blocks accounts created after
    // this point.
    public function up(): void
    {
        User::whereNull('email_verified_at')->update(['email_verified_at' => now()]);
    }

    public function down(): void
    {
        // no-op — we don't un-verify people
    }
};
