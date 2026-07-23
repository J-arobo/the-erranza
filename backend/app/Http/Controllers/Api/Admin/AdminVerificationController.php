<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\Admin\Concerns\LogsAdminActions;
use App\Http\Controllers\Controller;
use App\Models\VerificationSubmission;
use Illuminate\Http\Request;

class AdminVerificationController extends Controller
{
    use LogsAdminActions;

    public function index(Request $request)
    {
        $submissions = VerificationSubmission::where('status', 'pending')
            ->with('vendor:id,business_name,email')
            ->latest()
            ->get();

        return response()->json(['submissions' => $submissions]);
    }

    public function approve(Request $request, VerificationSubmission $submission)
    {
        $submission->update([
            'status' => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $submission->vendor->update(['verification_status' => 'approved']);

        $this->logAdminAction($request, 'approved verification', "vendor #{$submission->vendor_id} ({$submission->doc_type})");

        return response()->json(['submission' => $submission]);
    }

    public function reject(Request $request, VerificationSubmission $submission)
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string'],
        ]);

        $submission->update([
            'status' => 'rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $submission->vendor->update(['verification_status' => 'rejected']);

        $this->logAdminAction(
            $request,
            'rejected verification',
            "vendor #{$submission->vendor_id} ({$submission->doc_type})".(isset($validated['reason']) ? " — {$validated['reason']}" : '')
        );

        return response()->json(['submission' => $submission]);
    }
}
