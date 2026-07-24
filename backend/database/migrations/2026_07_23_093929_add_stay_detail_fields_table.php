<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->unsignedTinyInteger('bedrooms')->nullable()->after('max_guests');
            $table->unsignedTinyInteger('beds')->nullable()->after('bedrooms');
            $table->unsignedTinyInteger('bathrooms')->nullable()->after('beds');
            $table->decimal('lat', 10, 7)->nullable()->after('location');
            $table->decimal('lng', 10, 7)->nullable()->after('lat');
        });

        Schema::table('vendors', function (Blueprint $table) {
            $table->json('languages')->nullable()->after('bio');
        });
    }

    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropColumn(['bedrooms', 'beds', 'bathrooms', 'lat', 'lng']);
        });

        Schema::table('vendors', function (Blueprint $table) {
            $table->dropColumn('languages');
        });
    }
};
