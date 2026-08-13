<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use App\Services\SupportMessenger;

class VendorMessageController extends Controller
{
    // One row per traveller you've ever exchanged messages with, regardless
    // of which of your listings each message was about.
    public function index(Request $request)
    {
        $vendor = $request->attributes->get('vendor');
        $support = SupportMessenger::supportUser();

        $travellerIds = Message::where('vendor_id', $vendor->id)
            ->select('traveller_id')
            ->distinct()
            ->pluck('traveller_id')
            ->push($support->id)
            ->unique();

        $threads = $travellerIds->map(function ($travellerId) use ($vendor, $support) {
            $traveller = User::find($travellerId);
            if (! $traveller) {
                return null;
            }

            $last = Message::where('vendor_id', $vendor->id)->where('traveller_id', $travellerId)
                ->with(['listing:id,title', 'sender:id,name,avatar_url'])
                ->latest()
                ->first();

            return [
                'traveller_id' => $traveller->id,
                'guest_name' => $traveller->name,
                'guest_avatar' => $traveller->avatar_url,
                'is_support' => $traveller->id === $support->id,
                'listing_title' => $last?->listing?->title,
                'last_message' => $last?->text ?? ($traveller->id === $support->id ? "Welcome to Erranza — we're here if you need anything." : null),
                'last_message_at' => $last?->created_at,
                'unanswered' => Message::where('vendor_id', $vendor->id)->where('traveller_id', $travellerId)
                    ->where('sender_type', 'guest')->whereNull('read_at')->exists(),
            ];
        })->filter()->values();

        $supportThread = $threads->firstWhere('is_support', true);
        $otherThreads = $threads->where('is_support', false)->sortByDesc('last_message_at')->values();
        $ordered = $supportThread ? collect([$supportThread])->concat($otherThreads) : $otherThreads;

        return response()->json(['threads' => $ordered->values()]);
    }

    public function travellerThread(Request $request, User $traveller)
    {
        $vendor = $request->attributes->get('vendor');

        Message::where('vendor_id', $vendor->id)->where('traveller_id', $traveller->id)
            ->where('sender_type', 'guest')->whereNull('read_at')->update(['read_at' => now()]);

        $messages = Message::where('vendor_id', $vendor->id)->where('traveller_id', $traveller->id)
            ->with('listing:id,title')
            ->oldest()
            ->get();

        return response()->json([
            'traveller_id' => $traveller->id,
            'guest_name' => $traveller->name,
            'guest_avatar' => $traveller->avatar_url,
            'messages' => $messages,
        ]);
    }

    public function replyToTraveller(Request $request, User $traveller)
    {
        $vendor = $request->attributes->get('vendor');

        $validated = $request->validate([
            'text' => ['required', 'string'],
            'listing_id' => ['nullable', 'exists:listings,id'],
        ]);

        // Defaults to whatever listing the conversation was last about, so a
        // vendor just continuing the chat doesn't need to specify one.
        $listingId = $validated['listing_id']
            ?? Message::where('vendor_id', $vendor->id)->where('traveller_id', $traveller->id)->latest()->value('listing_id');

        $message = Message::create([
            'vendor_id' => $vendor->id,
            'listing_id' => $listingId,
            'traveller_id' => $traveller->id,
            'sender_type' => 'vendor',
            'sender_id' => $request->user()->id,
            'text' => $validated['text'],
        ]);

        $message->load('listing:id,title');

        return response()->json(['message' => $message], 201);
    }

    // Unread mesage
    public function unreadCount(Request $request)
    {
        $vendor = $request->attributes->get('vendor');

        $count = Message::where('vendor_id', $vendor->id)
            ->where('sender_type', 'guest')->whereNull('read_at')
            ->distinct()->count('traveller_id');

        return response()->json(['count' => $count]);
    }
}
