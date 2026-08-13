<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\Admin\Concerns\LogsAdminActions;
use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Models\VerificationSubmission;
use Illuminate\Http\Request;
use App\Services\SupportMessenger;

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
        $validated = $request->validate([
            'note' => ['nullable', 'string'],
        ]);

        $vendor = $submission->vendor;
        $wasApproved = $vendor->verification_status === 'approved';

        $submission->update([
            'status' => 'approved',
            'rejection_reason' => $validated['note'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $this->recomputeVendorVerificationStatus($vendor);
        $vendor->refresh();

        SupportMessenger::sendToVendor($vendor, "Your {$submission->doc_type} submission has been approved.");

        if (!$wasApproved && $vendor->verification_status === 'approved') {
            SupportMessenger::sendToVendor(
                $vendor,
                "🎉 Congratulations — your account is fully verified! You can now start listing on Erranza."
            );
        }

        $this->logAdminAction($request, 'approved verification', "vendor #{$submission->vendor_id} ({$submission->doc_type})", 'vendor', $vendor->id);

        return response()->json(['submission' => $submission]);
    }

    public function reject(Request $request, VerificationSubmission $submission)
    {
        $validated = $request->validate([
            'note' => ['nullable', 'string'],
        ]);

        $vendor = $submission->vendor;

        $submission->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['note'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $this->recomputeVendorVerificationStatus($vendor);

        SupportMessenger::sendToVendor(
            $vendor,
            "Your {$submission->doc_type} submission was rejected."
            .(!empty($validated['note']) ? " Reason: {$validated['note']}" : '')
            .' Please re-upload it from your dashboard.'
        );

        $this->logAdminAction(
            $request,
            'rejected verification',
            "vendor #{$submission->vendor_id} ({$submission->doc_type})".(isset($validated['note']) ? " — {$validated['note']}" : ''),
            'vendor',
            $vendor->id
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
