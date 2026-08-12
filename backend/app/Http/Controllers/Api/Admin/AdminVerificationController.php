<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\Admin\Concerns\LogsAdminActions;
use App\Http\Controllers\Controller;
use App\Models\Vendor;
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
            'rejection_reason' => null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $this->recomputeVendorVerificationStatus($submission->vendor);

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
            'rejection_reason' => $validated['reason'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $this->recomputeVendorVerificationStatus($submission->vendor);

        $this->logAdminAction(
            $request,
            'rejected verification',
            "vendor #{$submission->vendor_id} ({$submission->doc_type})".(isset($validated['reason']) ? " — {$validated['reason']}" : '')
        );

        return response()->json(['submission' => $submission]);
    }

    // A vendor's overall verification only counts as "approved" once every
    // document they've actually submitted is approved — using only the most
    // recent submission per doc_type, so re-uploading after a rejection
    // supersedes the old rejected row instead of being stuck behind it forever.
    private function recomputeVendorVerificationStatus(Vendor $vendor): void
    {
        $latestPerDocType = $vendor->verificationSubmissions()
            ->orderByDesc('created_at')
            ->get()
            ->unique('doc_type');

        if ($latestPerDocType->isEmpty()) {
            $vendor->update(['verification_status' => 'pending']);
            return;
        }

        if ($latestPerDocType->contains(fn ($s) => $s->status === 'rejected')) {
            $vendor->update(['verification_status' => 'rejected']);
            return;
        }

        if ($latestPerDocType->every(fn ($s) => $s->status === 'approved')) {
            $vendor->update(['verification_status' => 'approved']);
            return;
        }

        $vendor->update(['verification_status' => 'pending']);
    }
}
