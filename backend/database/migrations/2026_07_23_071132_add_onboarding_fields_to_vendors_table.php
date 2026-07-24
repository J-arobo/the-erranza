<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->string('license_number')->nullable()->after('bio');
            $table->string('tax_pin')->nullable()->after('license_number');
            $table->enum('payout_method', ['mobile', 'bank'])->nullable()->after('tax_pin');
            $table->string('payout_details')->nullable()->after('payout_method');
            $table->json('categories')->nullable()->after('payout_details');
            $table->json('regions')->nullable()->after('categories');
            $table->enum('plan', ['standard', 'plus'])->default('standard')->after('regions');
            $table->enum('default_cancellation_policy', ['flexible', 'moderate', 'strict'])->default('moderate')->after('plan');
            $table->boolean('onboarding_complete')->default(false)->after('default_cancellation_policy');
        });
    }

    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn([
                'license_number', 'tax_pin', 'payout_method', 'payout_details',
                'categories', 'regions', 'plan', 'default_cancellation_policy',
                'onboarding_complete',
            ]);
        });
    }
};
