<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listing_group_discounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('min_guests');
            $table->unsignedInteger('discount_percent');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listing_group_discounts');
    }
};
