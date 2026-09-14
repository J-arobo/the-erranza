<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Support\ImageResizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VendorListingPhotoController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'photo' => ['required', 'file', 'image', 'max:8192'],
        ]);

        $filename = 'listing-photos/' . Str::random(32) . '.jpg';
        $resized = ImageResizer::resize($validated['photo']->getRealPath(), 1920, 82);

        Storage::disk('public')->put($filename, $resized);

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        return response()->json(['url' => $disk->url($filename)], 201);
    }
}
