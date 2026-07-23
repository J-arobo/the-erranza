<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('category');
            $table->string('location');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('child_price', 10, 2)->nullable();
            $table->decimal('extra_guest_price', 10, 2)->nullable();
            $table->enum('status', ['active', 'draft', 'paused', 'suspended'])->default('draft');
            $table->unsignedInteger('min_guests')->nullable();
            $table->unsignedInteger('max_guests')->nullable();
            $table->unsignedInteger('min_lead_time_days')->nullable();
            $table->enum('cancellation_policy', ['flexible', 'moderate', 'strict', 'custom'])->default('moderate');
            $table->text('custom_cancellation_text')->nullable();
            $table->json('amenities')->nullable();
            $table->json('excluded')->nullable();
            $table->boolean('flagged')->default(false);
            $table->string('flag_reason')->nullable();
            $table->unsignedInteger('views')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
