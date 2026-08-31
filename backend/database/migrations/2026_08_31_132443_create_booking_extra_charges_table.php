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
        Schema::create('booking_extra_charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->text('description');
            $table->string('status')->default('pending'); // pending | declined | paid | failed
            $table->string('checkout_request_id')->nullable();
            $table->string('merchant_request_id')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_extra_charges');
    }

};
