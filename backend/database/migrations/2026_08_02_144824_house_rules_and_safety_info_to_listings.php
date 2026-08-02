<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            // house_rules shape: { selected: string[], additional_rules: string|null, additional_requests: string|null }
            $table->json('house_rules')->nullable();
            // safety_info shape: { key, note }[]
            $table->json('safety_info')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropColumn(['house_rules', 'safety_info']);
        });
    }
};
