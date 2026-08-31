<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('completion_code')->nullable()->after('status');
            $table->timestamp('completion_code_expires_at')->nullable()->after('completion_code');
            $table->timestamp('vendor_completed_at')->nullable()->after('completion_code_expires_at');
            $table->timestamp('traveller_completed_at')->nullable()->after('vendor_completed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['completion_code', 'completion_code_expires_at', 'vendor_completed_at', 'traveller_completed_at']);
        });
    }
};
