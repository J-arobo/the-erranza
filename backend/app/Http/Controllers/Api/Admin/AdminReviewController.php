<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\Admin\Concerns\LogsAdminActions;
use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class AdminReviewController extends Controller
{
    use LogsAdminActions;

    public function index(Request $request)
    {
        $reviews = Review::with(['listing:id,title', 'vendor:id,business_name', 'traveller:id,name'])
            ->latest()
            ->get();

        return response()->json(['reviews' => $reviews]);
    }

    public function remove(Request $request, Review $review)
    {
        $validated = $request->validate([
            'reason' => ['required', 'string'],
        ]);

        $review->update([
            'removed' => true,
            'remove_reason' => $validated['reason'],
        ]);

        $this->logAdminAction($request, 'removed review', "review #{$review->id} — {$validated['reason']}");

        return response()->json(['review' => $review]);
    }

    public function restore(Request $request, Review $review)
    {
        $review->update([
            'removed' => false,
            'remove_reason' => null,
        ]);

        $this->logAdminAction($request, 'restored review', "review #{$review->id}");

        return response()->json(['review' => $review]);
    }
}
