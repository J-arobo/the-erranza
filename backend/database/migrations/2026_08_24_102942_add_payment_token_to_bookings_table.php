<?php
// backend/database/migrations/2026_08_21_090000_add_payment_token_to_bookings_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('payment_token')->nullable()->unique()->after('id');
            $table->boolean('created_by_admin')->default(false)->after('traveller_id');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['payment_token', 'created_by_admin']);
        });
    }
};
