<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\ListingVirtualTourLink;
use App\Models\ListingVirtualTourScene;
use App\Support\ImageResizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VendorVirtualTourController extends Controller
{
    private function authorizeListing(Request $request, Listing $listing): void
    {
        $vendor = $request->attributes->get('vendor');
        abort_unless($listing->vendor_id === $vendor->id, 403);
        abort_unless($listing->category === 'Stays', 422, 'Virtual tours are only available for Stays listings.');
    }

    // Public within the vendor's own dashboard — full scene graph for the editor.
    public function index(Request $request, Listing $listing)
    {
        $this->authorizeListing($request, $listing);

        $scenes = $listing->virtualTourScenes()->with('links')->get();

        return response()->json([
            'scenes' => $scenes,
            'published_at' => $listing->virtual_tour_published_at,
        ]);
    }

    public function publish(Request $request, Listing $listing)
    {
        $this->authorizeListing($request, $listing);
        abort_if($listing->virtualTourScenes()->count() === 0, 422, 'Add at least one room before publishing.');

        $listing->update(['virtual_tour_published_at' => now()]);

        return response()->json(['published_at' => $listing->virtual_tour_published_at]);
    }

    public function unpublish(Request $request, Listing $listing)
    {
        $this->authorizeListing($request, $listing);
        $listing->update(['virtual_tour_published_at' => null]);

        return response()->json(['published_at' => null]);
    }

        // Wipes the whole tour — every scene and hotspot for this listing — and
    // takes it off the listing page if it was published.
    public function destroy(Request $request, Listing $listing)
    {
        $this->authorizeListing($request, $listing);

        $listing->virtualTourScenes()->delete();
        $listing->update(['virtual_tour_published_at' => null]);

        return response()->json(['message' => 'Virtual tour deleted.']);
    }

    // Uploads one 360 photo and creates its scene. Kept high-res (unlike
    // regular listing photos) since panorama detail matters more.
    public function storeScene(Request $request, Listing $listing)
    {
        $this->authorizeListing($request, $listing);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'panorama' => ['required', 'file', 'image', 'max:20480'],
        ]);

        $filename = 'virtual-tour/' . Str::random(32) . '.jpg';
        $resized = ImageResizer::resize($validated['panorama']->getRealPath(), 4096, 85);

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('public');
        $disk->put($filename, $resized);

        $scene = $listing->virtualTourScenes()->create([
            'name' => $validated['name'],
            'panorama_url' => url("/api/media/{$filename}"),
            'position' => $listing->virtualTourScenes()->max('position') + 1,
        ]);

        return response()->json(['scene' => $scene], 201);
    }

    public function updateScene(Request $request, Listing $listing, ListingVirtualTourScene $scene)
    {
        $this->authorizeListing($request, $listing);
        abort_unless($scene->listing_id === $listing->id, 403);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'position' => ['sometimes', 'integer'],
        ]);

        $scene->update($validated);

        return response()->json(['scene' => $scene]);
    }

    // Deleting a scene also removes any hotspot that points AT it (handled
    // by the target_scene_id FK cascade) as well as its own outgoing ones
    // (the scene_id FK cascade).
    public function destroyScene(Request $request, Listing $listing, ListingVirtualTourScene $scene)
    {
        $this->authorizeListing($request, $listing);
        abort_unless($scene->listing_id === $listing->id, 403);

        $scene->delete();

        return response()->json(['message' => 'Scene removed.']);
    }

    // Places a hotspot in $scene that jumps to target_scene_id, at the
    // yaw/pitch the vendor clicked in the live panorama.
    public function storeLink(Request $request, Listing $listing, ListingVirtualTourScene $scene)
    {
        $this->authorizeListing($request, $listing);
        abort_unless($scene->listing_id === $listing->id, 403);

        $validated = $request->validate([
            'target_scene_id' => ['required', 'integer', 'different:scene_id'],
            'yaw' => ['required', 'numeric'],
            'pitch' => ['required', 'numeric'],
        ]);

        $target = ListingVirtualTourScene::where('id', $validated['target_scene_id'])
            ->where('listing_id', $listing->id)
            ->firstOrFail();

        $link = $scene->links()->create([
            'target_scene_id' => $target->id,
            'yaw' => $validated['yaw'],
            'pitch' => $validated['pitch'],
        ]);

        return response()->json(['link' => $link], 201);
    }

    public function destroyLink(Request $request, Listing $listing, ListingVirtualTourScene $scene, ListingVirtualTourLink $link)
    {
        $this->authorizeListing($request, $listing);
        abort_unless($scene->listing_id === $listing->id && $link->scene_id === $scene->id, 403);

        $link->delete();

        return response()->json(['message' => 'Hotspot removed.']);
    }
}
