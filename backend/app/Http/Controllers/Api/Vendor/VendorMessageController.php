<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class VendorMessageController extends Controller
{
    public function index(Request $request)
    {
        $vendor = $request->attributes->get('vendor');

        $bookingThreads = Booking::whereHas('listing', fn ($q) => $q->where('vendor_id', $vendor->id))
            ->whereHas('messages')
            ->with([
                'listing:id,title',
                'traveller:id,name,avatar_url',
                'messages' => fn ($q) => $q->latest()->limit(1),
            ])
            ->get()
            ->map(function (Booking $booking) {
                $last = $booking->messages->first();

                return [
                    'type' => 'booking',
                    'booking_id' => $booking->id,
                    'listing_title' => $booking->listing->title,
                    'guest_name' => $booking->traveller->name,
                    'guest_avatar' => $booking->traveller->avatar_url,
                    'last_message' => $last?->text,
                    'last_message_at' => $last?->created_at,
                    'unanswered' => $last?->sender_type === 'guest',
                ];
            });

        $listingThreads = \App\Models\Message::whereHas('listing', fn ($q) => $q->where('vendor_id', $vendor->id))
            ->whereNull('booking_id')
            ->select('listing_id', 'traveller_id')
            ->distinct()
            ->get()
            ->map(function ($row) {
                $listing = \App\Models\Listing::find($row->listing_id);
                $traveller = \App\Models\User::find($row->traveller_id);
                if (! $listing || ! $traveller) {
                    return null;
                }

                $last = \App\Models\Message::where('listing_id', $listing->id)->where('traveller_id', $traveller->id)->latest()->first();

                return [
                    'type' => 'listing',
                    'listing_id' => $listing->id,
                    'traveller_id' => $traveller->id,
                    'listing_title' => $listing->title,
                    'guest_name' => $traveller->name,
                    'guest_avatar' => $traveller->avatar_url,
                    'last_message' => $last?->text,
                    'last_message_at' => $last?->created_at,
                    'unanswered' => $last?->sender_type === 'guest',
                ];
            })
            ->filter()
            ->values();

        $threads = $bookingThreads->concat($listingThreads)->sortByDesc('last_message_at')->values();

        return response()->json(['threads' => $threads]);
    }

    public function show(Request $request, Booking $booking)
    {
        $this->authorizeOwnership($request, $booking);

        $booking->load(['listing:id,title', 'traveller:id,name,avatar_url', 'messages.sender:id,name,avatar_url']);

        return response()->json([
            'booking_id' => $booking->id,
            'listing_title' => $booking->listing->title,
            'guest_name' => $booking->traveller->name,
            'guest_avatar' => $booking->traveller->avatar_url,
            'messages' => $booking->messages,
        ]);
    }

    public function store(Request $request, Booking $booking)
    {
        $this->authorizeOwnership($request, $booking);

        $validated = $request->validate([
            'text' => ['required', 'string'],
        ]);

        $message = $booking->messages()->create([
            'sender_type' => 'vendor',
            'sender_id' => $request->user()->id,
            'text' => $validated['text'],
        ]);

        return response()->json(['message' => $message], 201);
    }

    // Messages
    public function showListingThread(Request $request, \App\Models\Listing $listing, \App\Models\User $traveller)
    {
        $vendor = $request->attributes->get('vendor');
        abort_unless($listing->vendor_id === $vendor->id, 403);

        $messages = \App\Models\Message::where('listing_id', $listing->id)
            ->where('traveller_id', $traveller->id)
            ->oldest()
            ->get();

        return response()->json([
            'listing_title' => $listing->title,
            'guest_name' => $traveller->name,
            'guest_avatar' => $traveller->avatar_url,
            'messages' => $messages,
        ]);
    }

    public function storeListingThread(Request $request, \App\Models\Listing $listing, \App\Models\User $traveller)
    {
        $vendor = $request->attributes->get('vendor');
        abort_unless($listing->vendor_id === $vendor->id, 403);

        $validated = $request->validate([
            'text' => ['required', 'string'],
        ]);

        $message = \App\Models\Message::create([
            'listing_id' => $listing->id,
            'traveller_id' => $traveller->id,
            'sender_type' => 'vendor',
            'sender_id' => $request->user()->id,
            'text' => $validated['text'],
        ]);

        return response()->json(['message' => $message], 201);
    }



    private function authorizeOwnership(Request $request, Booking $booking): void
    {
        $vendor = $request->attributes->get('vendor');

        abort_unless($booking->listing->vendor_id === $vendor->id, 403);
    }
}