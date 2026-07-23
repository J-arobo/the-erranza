<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\Admin\Concerns\LogsAdminActions;
use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\Request;

class AdminListingController extends Controller
{
    use LogsAdminActions;

    public function index(Request $request)
    {
        $query = Listing::with('vendor:id,business_name');

        if ($request->boolean('flagged')) {
            $query->where('flagged', true);
        }

        $listings = $query->latest()->get();

        return response()->json(['listings' => $listings]);
    }

    public function suspend(Request $request, Listing $listing)
    {
        $validated = $request->validate([
            'reason' => ['required', 'string'],
        ]);

        $listing->update([
            'status' => 'suspended',
            'flagged' => true,
            'flag_reason' => $validated['reason'],
        ]);

        $this->logAdminAction($request, 'suspended listing', "{$listing->title} — {$validated['reason']}");

        return response()->json(['listing' => $listing]);
    }

    public function reinstate(Request $request, Listing $listing)
    {
        $listing->update([
            'status' => 'active',
            'flagged' => false,
            'flag_reason' => null,
        ]);

        $this->logAdminAction($request, 'reinstated listing', $listing->title);

        return response()->json(['listing' => $listing]);
    }
}
