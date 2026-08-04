<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->foreignId('vendor_id')->nullable()->after('traveller_id')->constrained()->cascadeOnDelete();
        });

        // Backfill vendor_id (and traveller_id where it's still missing) on
        // existing messages so old conversations still group correctly under
        // the new per-vendor threading.
        DB::table('messages')->whereNull('vendor_id')->orderBy('id')->chunkById(100, function ($messages) {
            foreach ($messages as $message) {
                $listingId = $message->listing_id;
                $travellerId = $message->traveller_id;

                if (! $listingId && $message->booking_id) {
                    $booking = DB::table('bookings')->find($message->booking_id);
                    if ($booking) {
                        $listingId = $booking->listing_id;
                        $travellerId = $booking->traveller_id;
                    }
                }

                if (! $listingId) {
                    continue;
                }

                $listing = DB::table('listings')->find($listingId);
                if (! $listing) {
                    continue;
                }

                DB::table('messages')->where('id', $message->id)->update([
                    'vendor_id' => $listing->vendor_id,
                    'traveller_id' => $travellerId,
                ]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropConstrainedForeignId('vendor_id');
        });
    }
};
