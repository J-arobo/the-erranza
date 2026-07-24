<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\VerificationSubmission;
use Illuminate\Http\Request;

class VendorVerificationController extends Controller
{
    public function index(Request $request)
    {
        $vendor = $request->attributes->get('vendor');

        return response()->json(['submissions' => $vendor->verificationSubmissions]);
    }

    public function store(Request $request)
    {
        $vendor = $request->attributes->get('vendor');

        $validated = $request->validate([
            'doc_type' => ['required', 'in:Government ID,Insurance certificate,Business license'],
        ]);

        $submission = $vendor->verificationSubmissions()->create([
            'doc_type' => $validated['doc_type'],
            'status' => 'pending',
        ]);

        return response()->json(['submission' => $submission], 201);
    }

    public function update(Request $request, VerificationSubmission $submission)
    {
        abort_unless($submission->vendor_id === $request->attributes->get('vendor')->id, 403);

        $validated = $request->validate([
            'expiry_date' => ['required', 'date'],
        ]);

        $submission->update($validated);

        return response()->json(['submission' => $submission]);
    }
}
