<?php

use App\Models\Vendor;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Vendor::where('verification_status', 'approved')
            ->whereNull('celebration_seen_at')
            ->update(['celebration_seen_at' => now()]);
    }

    public function down(): void
    {
        // Not reversible — no way to distinguish backfilled rows from genuinely-dismissed ones.
    }
};
