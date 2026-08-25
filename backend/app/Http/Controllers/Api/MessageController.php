<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Listing;
use App\Models\Message;
use App\Models\Vendor;
use Illuminate\Http\Request;
use App\Services\SupportMessenger;

class MessageController extends Controller
{
    // One row per vendor you've ever messaged, regardless of which of their
    // listings each individual message was about.
    public function index(Request $request)
    {
        $user = $request->user();
        $supportVendor = SupportMessenger::supportVendor();
        $bookingsVendor = SupportMessenger::bookingsVendor();

        $vendorIds = Message::where('traveller_id', $user->id)
            ->whereNotNull('vendor_id')
            ->select('vendor_id')
            ->distinct()
            ->pluck('vendor_id')
            ->push($supportVendor->id)
            ->unique();

        $threads = $vendorIds->map(function ($vendorId) use ($user, $supportVendor, $bookingsVendor) {
            $vendor = Vendor::find($vendorId);
            if (! $vendor) {
                return null;
            }

            $last = Message::where('vendor_id', $vendorId)->where('traveller_id', $user->id)
                ->with('listing:id,title')
                ->latest()
                ->first();

            $lastVendorMessage = Message::where('vendor_id', $vendorId)->where('traveller_id', $user->id)
                ->where('sender_type', 'vendor')
                ->with('sender:id,name,avatar_url')
                ->latest()
                ->first();

            return [
                'vendor_id' => $vendor->id,
                'vendor_name' => $vendor->business_name,
                'vendor_avatar' => $vendor->logo_url,
                'is_support' => $vendor->id === $supportVendor->id,
                'is_booking' => $vendor->id === $bookingsVendor->id,
                'listing_title' => $last?->listing?->title,
                'last_message' => $last?->text ?? ($vendor->id === $supportVendor->id ? "Welcome to Erranza — we're here if you need anything." : null),
                'last_message_at' => $last?->created_at,
                'last_sender_name' => $lastVendorMessage?->sender?->name,
                'last_sender_avatar' => $lastVendorMessage?->sender?->avatar_url,
                'unread' => Message::where('vendor_id', $vendorId)->where('traveller_id', $user->id)
                    ->where('sender_type', 'vendor')->whereNull('read_at')->exists(),
            ];
        })->filter()->values();

        $supportThread = $threads->firstWhere('is_support', true);
        $otherThreads = $threads->where('is_support', false)->sortByDesc('last_message_at')->values();
        $ordered = $supportThread ? collect([$supportThread])->concat($otherThreads) : $otherThreads;

        return response()->json(['threads' => $ordered->values()]);
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
                'is_support' => $vendor->id === SupportMessenger::supportVendor()->id,
                'is_booking' => $vendor->id === SupportMessenger::bookingsVendor()->id,
                'messages' => $messages,
            ]);
    }

    public function storeToVendor(Request $request, Vendor $vendor)
    {
        $isSupport = $vendor->id === SupportMessenger::supportVendor()->id;
        $isBooking = $vendor->id === SupportMessenger::bookingsVendor()->id;

        $validated = $request->validate([
            'text' => ['required', 'string'],
            'listing_id' => [($isSupport || $isBooking) ? 'nullable' : 'required', 'exists:listings,id'],
        ]);

        if ($isSupport || $isBooking) {
            $message = Message::create([
                'vendor_id' => $vendor->id,
                'listing_id' => $validated['listing_id'] ?? null,
                'traveller_id' => $request->user()->id,
                'sender_type' => 'guest',
                'sender_id' => $request->user()->id,
                'text' => $validated['text'],
            ]);

            $message->load('listing:id,title');

            return response()->json(['message' => $message], 201);
        }

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
