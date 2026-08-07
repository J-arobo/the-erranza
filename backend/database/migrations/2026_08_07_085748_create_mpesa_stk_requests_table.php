<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mpesa_stk_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('traveller_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('listing_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('guests');
            $table->date('check_in')->nullable();
            $table->date('check_out')->nullable();
            $table->foreignId('departure_id')->nullable()->constrained('listing_departures')->nullOnDelete();
            $table->text('special_requests')->nullable();
            $table->string('phone');
            $table->decimal('amount', 10, 2);
            $table->string('checkout_request_id')->unique();
            $table->string('merchant_request_id')->nullable();
            $table->string('status')->default('pending');
            $table->string('mpesa_receipt_number')->nullable();
            $table->string('result_desc')->nullable();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mpesa_stk_requests');
    }
};
