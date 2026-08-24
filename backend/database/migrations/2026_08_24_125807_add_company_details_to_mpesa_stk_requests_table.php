<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mpesa_stk_requests', function (Blueprint $table) {
            $table->string('company_name')->nullable();
            $table->string('company_tax_pin')->nullable();
            $table->string('billing_email')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('mpesa_stk_requests', function (Blueprint $table) {
            $table->dropColumn(['company_name', 'company_tax_pin', 'billing_email']);
        });
    }
};
