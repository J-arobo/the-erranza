<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\Admin\Concerns\LogsAdminActions;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Vendor;
use Illuminate\Http\Request;

class AdminVendorController extends Controller
{
    use LogsAdminActions;

    public function index(Request $request)
    {
        $vendors = Vendor::with('owner:id,name,email')
            ->withCount('listings')
            ->latest()
            ->get();

        return response()->json(['vendors' => $vendors]);
    }

    public function suspend(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'reason' => ['required', 'string'],
        ]);

        $vendor->update([
            'suspended' => true,
            'suspend_reason' => $validated['reason'],
        ]);

        $this->logAdminAction($request, 'suspended vendor', "{$vendor->business_name} — {$validated['reason']}");

        return response()->json(['vendor' => $vendor]);
    }

    public function reinstate(Request $request, Vendor $vendor)
    {
        $vendor->update([
            'suspended' => false,
            'suspend_reason' => null,
        ]);

        $this->logAdminAction($request, 'reinstated vendor', $vendor->business_name);

        return response()->json(['vendor' => $vendor]);
    }

    public function performance(Request $request, Vendor $vendor)
    {
        $vendor->loadCount('listings');

        $bookings = Booking::whereHas('listing', fn ($q) => $q->where('vendor_id', $vendor->id));

        return response()->json([
            'vendor' => $vendor,
            'total_bookings' => (clone $bookings)->count(),
            'completed_bookings' => (clone $bookings)->where('status', 'completed')->count(),
            'total_earnings' => (clone $bookings)->where('status', 'completed')->sum('total'),
            'average_rating' => round($vendor->reviews()->where('removed', false)->avg('rating') ?? 0, 2),
            'review_count' => $vendor->reviews()->where('removed', false)->count(),
        ]);
    }
}
