<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('verification_submissions', function (Blueprint $table) {
            $table->string('original_name')->nullable()->after('file_url');
            $table->unsignedBigInteger('file_size')->nullable()->after('original_name');
        });
    }

    public function down(): void
    {
        Schema::table('verification_submissions', function (Blueprint $table) {
            $table->dropColumn(['original_name', 'file_size']);
        });
    }
};
