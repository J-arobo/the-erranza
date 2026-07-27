<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $listingIds = $request->user()->wishlistItems()->pluck('listing_id');

        $listings = Listing::whereIn('id', $listingIds)
            ->with(['images', 'vendor:id,business_name'])
            ->withCount(['reviews' => fn ($q) => $q->where('removed', false)])
            ->withAvg(['reviews' => fn ($q) => $q->where('removed', false)], 'rating')
            ->get();

        return response()->json(['listings' => $listings]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'listing_id' => ['required', 'exists:listings,id'],
        ]);

        $request->user()->wishlistItems()->firstOrCreate([
            'listing_id' => $validated['listing_id'],
        ]);

        return response()->json(['message' => 'Added to wishlist.'], 201);
    }

    public function destroy(Request $request, Listing $listing)
    {
        $request->user()->wishlistItems()->where('listing_id', $listing->id)->delete();

        return response()->json(['message' => 'Removed from wishlist.']);
    }
}
