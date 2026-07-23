<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_configs', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('commission_standard')->default(12);
            $table->unsignedTinyInteger('commission_plus')->default(8);
            $table->decimal('plus_price_monthly', 10, 2)->default(2500);
            $table->enum('default_cancellation_policy', ['flexible', 'moderate', 'strict'])->default('moderate');
            $table->unsignedInteger('dispute_ceiling')->default(20000);
            $table->boolean('maintenance_mode')->default(false);
            $table->text('maintenance_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_configs');
    }
};
