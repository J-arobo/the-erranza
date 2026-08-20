<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VendorListingPhotoController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'photo' => ['required', 'file', 'image', 'max:8192'],
        ]);

        $path = $validated['photo']->store('listing-photos', 'public');
        $path = $validated['photo']->store('listing-photos', 'public');

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        return response()->json(['url' => $disk->url($path)], 201);
    }
}
