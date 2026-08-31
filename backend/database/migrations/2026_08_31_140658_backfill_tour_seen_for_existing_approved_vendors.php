<?php

use App\Models\Vendor;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Vendor::where('verification_status', 'approved')
            ->whereNull('tour_seen_at')
            ->update(['tour_seen_at' => now()]);
    }

    public function down(): void
    {
        // Not reversible — no way to distinguish backfilled rows from genuinely-completed tours.
    }
};
