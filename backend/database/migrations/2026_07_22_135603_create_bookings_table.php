<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->constrained()->cascadeOnDelete();
            $table->foreignId('traveller_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled', 'alternative_proposed'])->default('pending');
            $table->unsignedInteger('guests');
            $table->decimal('total', 10, 2);
            $table->date('check_in')->nullable();
            $table->date('check_out')->nullable();
            $table->date('proposed_date')->nullable();
            $table->unsignedInteger('refund_percent')->nullable();
            $table->decimal('refund_amount', 10, 2)->nullable();
            $table->text('special_requests')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
