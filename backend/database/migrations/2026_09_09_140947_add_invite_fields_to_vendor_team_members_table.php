<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vendor_team_members', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('vendor_id')->constrained()->nullOnDelete();
            $table->string('invite_token')->nullable()->after('status');
            $table->timestamp('invite_token_expires_at')->nullable()->after('invite_token');
        });
    }

    public function down(): void
    {
        Schema::table('vendor_team_members', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn(['invite_token', 'invite_token_expires_at']);
        });
    }
};
