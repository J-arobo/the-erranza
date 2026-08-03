<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->foreignId('booking_id')->nullable()->change();
            $table->foreignId('listing_id')->nullable()->after('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('traveller_id')->nullable()->after('listing_id')->constrained('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropConstrainedForeignId('listing_id');
            $table->dropConstrainedForeignId('traveller_id');
            $table->foreignId('booking_id')->nullable(false)->change();
        });
    }
};
