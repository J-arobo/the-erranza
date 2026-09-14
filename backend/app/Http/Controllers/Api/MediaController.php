<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    // Serves a public-disk file with an explicit CORS header — needed for
    // anything read cross-origin into a WebGL texture (the 360 tour viewer),
    // which a plain static-file response never gets, regardless of whether
    // the dev server or production's webserver bypasses Laravel for it.
    public function show(string $path)
    {
        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        abort_unless($disk->exists($path), 404);

        return $disk->response($path, null, [
            'Access-Control-Allow-Origin' => '*',
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }

}