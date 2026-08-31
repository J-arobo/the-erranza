<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\BookingPayout;
use App\Models\Vendor;
use App\Models\Booking;
use Illuminate\Http\Request;

class SuperAdminFinancialController extends Controller
{
    // All-time aggregate, from completed bookings directly — kept separate
    // from payouts() below, which reflects the newer booking_payouts ledger
    // and only has data going forward from when that table started being
    // written to.
    public function index(Request $request)
    {
        $vendors = Vendor::with(['listings.bookings' => fn ($q) => $q->where('status', 'completed')])->get();

        $payouts = $vendors->map(function (Vendor $vendor) {
            // Each vendor's own plan rate — this used to be a single flat
            // rate read from PlatformConfig, which quietly undercounted
            // commission for every vendor on the Plus plan.
            $commissionRate = $vendor->plan === 'plus' ? 0.08 : 0.12;
            $gross = $vendor->listings->flatMap->bookings->sum('total');
            $commission = round($gross * $commissionRate, 2);

            return [
                'vendor_id' => $vendor->id,
                'business_name' => $vendor->business_name,
                'gross_earnings' => round($gross, 2),
                'commission' => $commission,
                'payout' => round($gross - $commission, 2),
            ];
        });

        return response()->json([
            'gross_platform_revenue' => round($payouts->sum('gross_earnings'), 2),
            'total_commission' => round($payouts->sum('commission'), 2),
            'total_payouts' => round($payouts->sum('payout'), 2),
            'vendors' => $payouts->values(),
        ]);
    }

    // Live activity feed backed by booking_payouts — one row per leg
    // (vendor / commission), each with its own independent status.
    public function payouts(Request $request)
    {
        $payouts = BookingPayout::with(['booking.listing:id,title', 'vendor:id,business_name'])
            ->latest()
            ->paginate(25);

        $vendorDisbursedThisMonth = BookingPayout::where('leg', 'vendor')
            ->where('status', 'paid')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount');

        $commissionPending = BookingPayout::where('leg', 'commission')
            ->where('status', 'pending')
            ->sum('amount');

        $failedVendorPayouts = BookingPayout::where('leg', 'vendor')
            ->where('status', 'failed')
            ->count();

        return response()->json([
            'payouts' => $payouts,
            'summary' => [
                'vendor_disbursed_this_month' => round((float) $vendorDisbursedThisMonth, 2),
                'commission_pending' => round((float) $commissionPending, 2),
                'failed_vendor_payouts' => $failedVendorPayouts,
            ],
        ]);
    }

        // Search/list for the booking tracker — by booking ID, traveller
    // name/email, or listing title.
    public function bookings(Request $request)
    {
        $query = Booking::with([
            'listing:id,title,vendor_id',
            'listing.vendor:id,business_name',
            'traveller:id,name,email',
        ]);

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('id', $search)
                    ->orWhereHas('traveller', fn ($q2) => $q2->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
                    ->orWhereHas('listing', fn ($q2) => $q2->where('title', 'like', "%{$search}%"));
            });
        }

        return response()->json($query->latest()->paginate(25));
    }

    // The full tracker for one booking — payment status, trip dates,
    // completion, extra charges, and both payout legs with their exact
    // status/reference/destination, so a super-admin can see end-to-end
    // where a specific payment actually is.
    public function bookingDetail(Request $request, Booking $booking)
    {
        $booking->load([
            'listing:id,title,vendor_id',
            'listing.vendor:id,business_name,plan,payout_method,payout_bank_name,payout_details',
            'traveller:id,name,email',
            'payments',
            'extraCharges',
            'payouts',
        ]);

        return response()->json(['booking' => $booking]);
    }

}
