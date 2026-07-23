<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use Illuminate\Http\Request;

class ListingController extends Controller
{
    public function index(Request $request)
    {
        $query = Listing::query()
            ->where('status', 'active')
            ->whereHas('vendor', fn ($q) => $q->where('suspended', false));

        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }

        if ($request->filled('location')) {
            $query->where('location', 'like', '%'.$request->string('location').'%');
        }

        if ($request->filled('q')) {
            $search = $request->string('q');
            $query->where(fn ($q) => $q->where('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%"));
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->float('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->float('max_price'));
        }

        $listings = $query->with(['images', 'vendor:id,business_name,verification_status'])
            ->withCount(['reviews' => fn ($q) => $q->where('removed', false)])
            ->withAvg(['reviews' => fn ($q) => $q->where('removed', false)], 'rating')
            ->paginate(12);

        return response()->json($listings);
    }

    public function show(Listing $listing)
    {
        abort_unless($listing->status === 'active', 404);

        $listing->load([
            'images', 'itinerary', 'durationOptions', 'seasonalRates',
            'groupDiscounts', 'departures', 'blockedDates',
            'vendor:id,business_name,bio,logo_url,verification_status',
            'reviews' => fn ($q) => $q->where('removed', false)->with('traveller:id,name')->latest(),
        ]);

        $listing->loadCount(['reviews' => fn ($q) => $q->where('removed', false)]);
        $listing->loadAvg(['reviews' => fn ($q) => $q->where('removed', false)], 'rating');

        return response()->json(['listing' => $listing]);
    }
}
