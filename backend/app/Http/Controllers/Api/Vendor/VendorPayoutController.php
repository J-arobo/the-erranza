<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\BookingPayout;
use App\Services\BookingPayoutService;
use Illuminate\Http\Request;

class VendorPayoutController extends Controller
{
    public function index(Request $request)
    {
        $vendor = $request->attributes->get('vendor');

        $base = fn () => BookingPayout::where('vendor_id', $vendor->id)->where('leg', 'vendor');

        $payouts = $base()
            ->with('booking.traveller:id,name', 'booking.listing:id,title')
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (BookingPayout $p) => [
                'id' => $p->id,
                'amount' => (float) $p->amount,
                'status' => $p->status,
                'reference' => $p->reference,
                'failure_reason' => $p->failure_reason,
                'paid_at' => $p->paid_at,
                'created_at' => $p->created_at,
                'booking_id' => $p->booking_id,
                'traveller_name' => $p->booking?->traveller?->name,
                'listing_title' => $p->booking?->listing?->title,
            ]);

        return response()->json([
            'payouts' => $payouts,
            'summary' => [
                'paid' => (float) $base()->where('status', 'paid')->sum('amount'),
                'pending' => (float) $base()->whereIn('status', ['pending', 'processing'])->sum('amount'),
                'failed' => (float) $base()->where('status', 'failed')->sum('amount'),
            ],
        ]);
    }

    public function retry(Request $request, BookingPayout $payout)
    {
        $vendor = $request->attributes->get('vendor');

        abort_unless($payout->vendor_id === $vendor->id && $payout->leg === 'vendor', 403);
        abort_unless($payout->status === 'failed', 422, 'Only a failed payout can be retried.');

        BookingPayoutService::retryVendorLeg($payout);

        return response()->json(['payout' => ['id' => $payout->id, 'status' => $payout->fresh()->status]]);
    }
}
