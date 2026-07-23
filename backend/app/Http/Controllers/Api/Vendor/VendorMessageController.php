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

        $threads = Booking::whereHas('listing', fn ($q) => $q->where('vendor_id', $vendor->id))
            ->whereHas('messages')
            ->with([
                'listing:id,title',
                'traveller:id,name',
                'messages' => fn ($q) => $q->latest()->limit(1),
            ])
            ->get()
            ->map(function (Booking $booking) {
                $last = $booking->messages->first();

                return [
                    'booking_id' => $booking->id,
                    'listing_title' => $booking->listing->title,
                    'guest_name' => $booking->traveller->name,
                    'last_message' => $last?->text,
                    'last_message_at' => $last?->created_at,
                    'unanswered' => $last?->sender_type === 'guest',
                ];
            })
            ->sortByDesc('last_message_at')
            ->values();

        return response()->json(['threads' => $threads]);
    }

    public function show(Request $request, Booking $booking)
    {
        $this->authorizeOwnership($request, $booking);

        $booking->load(['listing:id,title', 'traveller:id,name', 'messages.sender:id,name']);

        return response()->json([
            'booking_id' => $booking->id,
            'listing_title' => $booking->listing->title,
            'guest_name' => $booking->traveller->name,
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

    private function authorizeOwnership(Request $request, Booking $booking): void
    {
        $vendor = $request->attributes->get('vendor');

        abort_unless($booking->listing->vendor_id === $vendor->id, 403);
    }
}