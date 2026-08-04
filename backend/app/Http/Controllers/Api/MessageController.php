<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Listing;
use App\Models\Message;
use App\Models\Vendor;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    // One row per vendor you've ever messaged, regardless of which of their
    // listings each individual message was about.
    public function index(Request $request)
    {
        $user = $request->user();

        $vendorIds = Message::where('traveller_id', $user->id)
            ->whereNotNull('vendor_id')
            ->select('vendor_id')
            ->distinct()
            ->pluck('vendor_id');

        $threads = $vendorIds->map(function ($vendorId) use ($user) {
            $vendor = Vendor::find($vendorId);
            if (! $vendor) {
                return null;
            }

            $last = Message::where('vendor_id', $vendorId)->where('traveller_id', $user->id)
                ->with(['listing:id,title', 'sender:id,name,avatar_url'])
                ->latest()
                ->first();

            return [
                'vendor_id' => $vendor->id,
                'vendor_name' => $vendor->business_name,
                'vendor_avatar' => $vendor->logo_url,
                'listing_title' => $last?->listing?->title,
                'last_message' => $last?->text,
                'last_message_at' => $last?->created_at,
                // Only surfaced once an actual staff member has replied —
                // before that there's no "who" to show, just the vendor.
                'last_sender_name' => $last?->sender_type === 'vendor' ? $last?->sender?->name : null,
                'last_sender_avatar' => $last?->sender_type === 'vendor' ? $last?->sender?->avatar_url : null,
                'unread' => Message::where('vendor_id', $vendorId)->where('traveller_id', $user->id)
                    ->where('sender_type', 'vendor')->whereNull('read_at')->exists(),
            ];
        })->filter()->sortByDesc('last_message_at')->values();

        return response()->json(['threads' => $threads]);
    }

    public function vendorThread(Request $request, Vendor $vendor)
    {
        $user = $request->user();

        Message::where('vendor_id', $vendor->id)->where('traveller_id', $user->id)
            ->where('sender_type', 'vendor')->whereNull('read_at')->update(['read_at' => now()]);

        $messages = Message::where('vendor_id', $vendor->id)->where('traveller_id', $user->id)
            ->with(['listing:id,title', 'sender:id,name,avatar_url'])
            ->oldest()
            ->get();

        return response()->json([
            'vendor_id' => $vendor->id,
            'vendor_name' => $vendor->business_name,
            'vendor_avatar' => $vendor->logo_url,
            'messages' => $messages,
        ]);
    }

    public function storeToVendor(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'text' => ['required', 'string'],
            'listing_id' => ['required', 'exists:listings,id'],
        ]);

        $listing = Listing::findOrFail($validated['listing_id']);
        abort_unless($listing->vendor_id === $vendor->id, 422, 'This listing does not belong to that vendor.');

        $message = Message::create([
            'vendor_id' => $vendor->id,
            'listing_id' => $listing->id,
            'traveller_id' => $request->user()->id,
            'sender_type' => 'guest',
            'sender_id' => $request->user()->id,
            'text' => $validated['text'],
        ]);

        $vendor->notifications()->create([
            'type' => 'message',
            'title' => 'New message',
            'message' => "{$request->user()->name} sent a message about \"{$listing->title}\".",
            'link' => '/vendor/messages',
        ]);

        $message->load('listing:id,title');

        return response()->json(['message' => $message], 201);
    }

    // Unread mesage
    public function unreadCount(Request $request)
    {
        $user = $request->user();

        $count = Message::where('traveller_id', $user->id)->whereNotNull('vendor_id')
            ->where('sender_type', 'vendor')->whereNull('read_at')
            ->distinct()->count('vendor_id');

        return response()->json(['count' => $count]);
    }
}
