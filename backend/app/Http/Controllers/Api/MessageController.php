<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class MessageController extends Controller
{
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
