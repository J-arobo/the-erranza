<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
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
        $resized = $this->resize($validated['photo']->getRealPath(), 1920, 82);

        Storage::disk('public')->put($filename, $resized);

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        return response()->json(['url' => $disk->url($filename)], 201);
    }

    // Downscales to a max width and re-encodes as a compressed JPEG — a
    // straight-off-the-phone 8MB photo comes out well under 500KB, and
    // every rendering of it (hero, thumbnail, gallery) starts from that
    // instead of the full original.
    private function resize(string $path, int $maxWidth, int $quality): string
    {
        [$width, $height, $type] = getimagesize($path);

        $source = match ($type) {
            IMAGETYPE_JPEG => imagecreatefromjpeg($path),
            IMAGETYPE_PNG => imagecreatefrompng($path),
            IMAGETYPE_WEBP => imagecreatefromwebp($path),
            IMAGETYPE_GIF => imagecreatefromgif($path),
            default => imagecreatefromstring(file_get_contents($path)),
        };

        if ($width > $maxWidth) {
            $newWidth = $maxWidth;
            $newHeight = (int) round($height * ($maxWidth / $width));
        } else {
            $newWidth = $width;
            $newHeight = $height;
        }

        $canvas = imagecreatetruecolor($newWidth, $newHeight);
        // Flatten any transparency onto white — output is JPEG, which has none.
        imagefill($canvas, 0, 0, imagecolorallocate($canvas, 255, 255, 255));
        imagecopyresampled($canvas, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        ob_start();
        imagejpeg($canvas, null, $quality);
        $data = ob_get_clean();

        imagejpeg($canvas, null, $quality);
        $data = ob_get_clean();

        return $data;
    }
}
