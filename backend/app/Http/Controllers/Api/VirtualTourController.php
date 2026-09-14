<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;

class VirtualTourController extends Controller
{
    public function show(Listing $listing)
    {
        abort_if(!$listing->virtual_tour_published_at, 404, 'This listing has no virtual tour.');

        $scenes = $listing->virtualTourScenes()->with('links')->get();

        abort_if($scenes->isEmpty(), 404, 'This listing has no virtual tour.');

        return response()->json(['scenes' => $scenes]);
    }
}
