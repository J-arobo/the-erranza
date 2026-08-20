<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mpesa_payout_verifications', function (Blueprint $table) {
            $table->string('refund_status')->nullable()->after('mpesa_receipt_number');
            $table->string('refund_conversation_id')->nullable()->after('refund_status');
            $table->string('refund_receipt_number')->nullable()->after('refund_conversation_id');
            $table->timestamp('refunded_at')->nullable()->after('refund_receipt_number');
        });
    }

    public function down(): void
    {
        Schema::table('mpesa_payout_verifications', function (Blueprint $table) {
            $table->dropColumn(['refund_status', 'refund_conversation_id', 'refund_receipt_number', 'refunded_at']);
        });
    }
};
