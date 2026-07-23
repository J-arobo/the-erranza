<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Api\Admin\Concerns\LogsAdminActions;
use App\Http\Controllers\Controller;
use App\Models\Dispute;
use Illuminate\Http\Request;

class SuperAdminDisputeController extends Controller
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

        return response()->json(['disputes' => $disputes]);
    }

    public function override(Request $request, Dispute $dispute)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:resolved,open'],
        ]);

        $dispute->update([
            'status' => $validated['status'],
            'resolved_by' => $validated['status'] === 'resolved' ? $request->user()->id : null,
            'resolved_at' => $validated['status'] === 'resolved' ? now() : null,
        ]);

        $this->logAdminAction($request, 'overrode dispute', "dispute #{$dispute->id} — Ksh {$dispute->amount} → {$validated['status']}");

        return response()->json(['dispute' => $dispute]);
    }
}
