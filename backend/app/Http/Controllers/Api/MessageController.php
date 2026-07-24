<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request)
    {
        $threads = $request->user()->bookings()
            ->whereHas('messages')
            ->with([
                'listing:id,title',
                'listing.images',
                'listing.vendor:id,business_name',
                'messages' => fn ($q) => $q->latest()->limit(1),
            ])
            ->get()
            ->map(function (Booking $booking) {
                $last = $booking->messages->first();

                return [
                    'booking_id' => $booking->id,
                    'listing_title' => $booking->listing->title,
                    'listing_image' => $booking->listing->images->first()?->url,
                    'vendor_name' => $booking->listing->vendor->business_name,
                    'last_message' => $last?->text,
                    'last_message_at' => $last?->created_at,
                    'unread' => $last?->sender_type === 'vendor',
                ];
            })
            ->sortByDesc('last_message_at')
            ->values();

        return response()->json(['threads' => $threads]);
    }

    public function show(Request $request, Booking $booking)
    {
        abort_unless($booking->traveller_id === $request->user()->id, 403);

        $booking->load(['listing:id,title', 'listing.images', 'listing.vendor:id,business_name', 'messages.sender']);

        return response()->json([
            'booking_id' => $booking->id,
            'listing_title' => $booking->listing->title,
            'listing_image' => $booking->listing->images->first()?->url,
            'vendor_name' => $booking->listing->vendor->business_name,
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
