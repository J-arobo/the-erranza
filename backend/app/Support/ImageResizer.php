<?php

namespace App\Support;

class ImageResizer
{
    // Downscales to a max width (preserving aspect ratio) and re-encodes as
    // a compressed JPEG. Used for both regular listing photos and 360
    // panoramas — panoramas just get a much higher max width, since detail
    // matters more when someone can zoom into a sphere.
    public static function resize(string $path, int $maxWidth, int $quality): string
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
        imagefill($canvas, 0, 0, imagecolorallocate($canvas, 255, 255, 255));
        imagecopyresampled($canvas, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        ob_start();
        imagejpeg($canvas, null, $quality);

        return ob_get_clean();
    }
}
