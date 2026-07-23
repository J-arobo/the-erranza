<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class VendorReviewController extends Controller
{
    public function index(Request $request)
    {
        $vendor = $request->attributes->get('vendor');

        $reviews = $vendor->reviews()
            ->with(['listing:id,title', 'traveller:id,name'])
            ->latest()
            ->get();

        return response()->json(['reviews' => $reviews]);
    }

    public function reply(Request $request, Review $review)
    {
        $vendor = $request->attributes->get('vendor');

        abort_unless($review->vendor_id === $vendor->id, 403);

        $validated = $request->validate([
            'reply_text' => ['required', 'string'],
        ]);

        $review->update([
            'reply_text' => $validated['reply_text'],
            'replied' => true,
        ]);

        return response()->json(['review' => $review]);
    }
}
