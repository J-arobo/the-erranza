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

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->string('search') . '%');
        }

        if ($request->filled('category') && $request->string('category') !== 'All') {
            $query->where('category', $request->string('category'));
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

        $listing->load('vendor:id,business_name');

        $this->logAdminAction($request, 'suspended listing', "{$listing->title} — {$validated['reason']}", 'listing', $listing->id);


        return response()->json(['listing' => $listing]);
    }

    public function reinstate(Request $request, Listing $listing)
    {
        $listing->update([
            'status' => 'active',
            'flagged' => false,
            'flag_reason' => null,
        ]);

        $listing->load('vendor:id,business_name');

        $this->logAdminAction($request, 'reinstated listing', $listing->title, 'listing', $listing->id);

        return response()->json(['listing' => $listing]);
    }
}
