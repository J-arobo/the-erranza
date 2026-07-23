<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, Booking $booking)
    {
        abort_unless($booking->traveller_id === $request->user()->id, 403);
        abort_unless($booking->status === 'completed', 422, 'You can only review completed bookings.');
        abort_if($booking->review()->exists(), 422, 'You have already reviewed this booking.');

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['required', 'string'],
        ]);

        $review = $booking->review()->create([
            'listing_id' => $booking->listing_id,
            'vendor_id' => $booking->listing->vendor_id,
            'traveller_id' => $request->user()->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
        ]);

        return response()->json(['review' => $review], 201);
    }
}
