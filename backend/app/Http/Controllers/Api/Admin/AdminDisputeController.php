<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\Admin\Concerns\LogsAdminActions;
use App\Http\Controllers\Controller;
use App\Models\Dispute;
use App\Models\PlatformConfig;
use Illuminate\Http\Request;

class AdminDisputeController extends Controller
{
    use LogsAdminActions;

    public function index(Request $request)
    {
        $disputes = Dispute::with([
            'booking.listing:id,title,vendor_id',
            'booking.listing.vendor:id,business_name',
            'raisedBy:id,name',
        ])
            ->latest()
            ->get();

        return response()->json([
            'disputes' => $disputes,
            'ceiling' => PlatformConfig::current()->dispute_ceiling,
        ]);
    }

    public function resolve(Request $request, Dispute $dispute)
    {
        $ceiling = PlatformConfig::current()->dispute_ceiling;

        abort_if(
            $dispute->amount > $ceiling,
            422,
            "This dispute exceeds the admin resolution ceiling (Ksh {$ceiling}) and must be escalated."
        );

        $dispute->update([
            'status' => 'resolved',
            'resolved_by' => $request->user()->id,
            'resolved_at' => now(),
        ]);

        $this->logAdminAction($request, 'resolved dispute', "dispute #{$dispute->id} — Ksh {$dispute->amount}");

        return response()->json(['dispute' => $dispute]);
    }

    public function escalate(Request $request, Dispute $dispute)
    {
        $dispute->update(['status' => 'escalated']);

        $this->logAdminAction($request, 'escalated dispute', "dispute #{$dispute->id} — Ksh {$dispute->amount}");

        return response()->json(['dispute' => $dispute]);
    }
}
