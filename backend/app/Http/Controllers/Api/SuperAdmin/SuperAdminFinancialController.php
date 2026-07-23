<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\PlatformConfig;
use App\Models\Vendor;
use Illuminate\Http\Request;

class SuperAdminFinancialController extends Controller
{
    public function index(Request $request)
    {
        $config = PlatformConfig::current();
        $commissionRate = $config->commission_standard / 100;

        $vendors = Vendor::with(['listings.bookings' => fn ($q) => $q->where('status', 'completed')])->get();

        $payouts = $vendors->map(function (Vendor $vendor) use ($commissionRate) {
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
            'commission_rate' => $config->commission_standard,
            'gross_platform_revenue' => round($payouts->sum('gross_earnings'), 2),
            'total_commission' => round($payouts->sum('commission'), 2),
            'total_payouts' => round($payouts->sum('payout'), 2),
            'vendors' => $payouts->values(),
        ]);
    }
}
