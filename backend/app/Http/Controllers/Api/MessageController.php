<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $bookingThreads = $user->bookings()
            ->whereHas('messages')
            ->with([
                'listing:id,title,vendor_id',
                'listing.images',
                'listing.vendor:id,business_name,logo_url',
                'messages' => fn($q) => $q->latest()->limit(1),
            ])
            ->get()
            ->map(function (Booking $booking) {
                $last = $booking->messages->first();

                return [
                    'type' => 'booking',
                    'id' => $booking->id,
                    'listing_title' => $booking->listing->title,
                    'listing_image' => $booking->listing->images->first()?->url,
                    'vendor_name' => $booking->listing->vendor->business_name,
                    'vendor_avatar' => $booking->listing->vendor->logo_url,
                    'last_message' => $last?->text,
                    'last_message_at' => $last?->created_at,
                    'unread' => $last?->sender_type === 'vendor',
                ];
            });

        // Pre-booking inquiries — messages tied to a listing rather than a
        // booking. Grouped by listing since every row here already belongs
        // to this traveller (booking_id is null only for their own inquiries).
        $listingThreads = Message::where('traveller_id', $user->id)
            ->whereNull('booking_id')
            ->select('listing_id')
            ->distinct()
            ->get()
            ->map(function ($row) use ($user) {
                $listing = \App\Models\Listing::with(['images', 'vendor:id,business_name,logo_url'])->find($row->listing_id);
                if (! $listing) {
                    return null;
                }

                $last = Message::where('listing_id', $listing->id)->where('traveller_id', $user->id)->latest()->first();

                return [
                    'type' => 'listing',
                    'id' => $listing->id,
                    'listing_title' => $listing->title,
                    'listing_image' => $listing->images->first()?->url,
                    'vendor_name' => $listing->vendor->business_name,
                    'vendor_avatar' => $listing->vendor->logo_url,
                    'last_message' => $last?->text,
                    'last_message_at' => $last?->created_at,
                    'unread' => $last?->sender_type === 'vendor',
                ];
            })
            ->filter()
            ->values();

        $threads = $bookingThreads->concat($listingThreads)->sortByDesc('last_message_at')->values();

        return response()->json(['threads' => $threads]);
    }

    public function show(Request $request, Booking $booking)
    {
        abort_unless($booking->traveller_id === $request->user()->id, 403);

        $booking->load(['listing:id,title,vendor_id', 'listing.images', 'listing.vendor:id,business_name,logo_url', 'messages.sender']);

        return response()->json([
            'booking_id' => $booking->id,
            'listing_title' => $booking->listing->title,
            'listing_image' => $booking->listing->images->first()?->url,
            'vendor_name' => $booking->listing->vendor->business_name,
            'vendor_avatar' => $booking->listing->vendor->logo_url,
            'messages' => $booking->messages,
        ]);
    }

    public function store(Request $request, Booking $booking)
    {
        abort_unless($booking->traveller_id === $request->user()->id, 403);

        $validated = $request->validate([
            'text' => ['required', 'string'],
        ]);

        $message = $booking->messages()->create([
            'sender_type' => 'guest',
            'sender_id' => $request->user()->id,
            'text' => $validated['text'],
        ]);

        return response()->json(['message' => $message], 201);
    }
}
