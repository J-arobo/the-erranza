<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\VerificationSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
            'document' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        $file = $request->file('document');
        $path = $file->store('verification-documents', 'public');

        $submission = $vendor->verificationSubmissions()->create([
            'doc_type' => $validated['doc_type'],
            'file_url' => $path,
            'original_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'status' => 'pending',
        ]);

        return response()->json(['submission' => $submission], 201);
    }

    // Delete a verification submission
    public function destroy(Request $request, VerificationSubmission $submission)
    {
        abort_unless($submission->vendor_id === $request->attributes->get('vendor')->id, 403);

        Storage::disk('public')->delete($submission->getRawOriginal('file_url'));
        $submission->delete();

        return response()->json(['message' => 'Deleted']);
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
