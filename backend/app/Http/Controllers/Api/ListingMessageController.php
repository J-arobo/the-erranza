<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\Message;
use Illuminate\Http\Request;

class ListingMessageController extends Controller
{
    public function show(Request $request, Listing $listing)
    {
        // Opening the thread marks the vendor's messages as read.
        Message::where('listing_id', $listing->id)->where('traveller_id', $request->user()->id)
            ->where('sender_type', 'vendor')->whereNull('read_at')->update(['read_at' => now()]);

        $messages = Message::where('listing_id', $listing->id)
            ->where('traveller_id', $request->user()->id)
            ->oldest()
            ->get();


            return response()->json([
                'listing_title' => $listing->title,
                'listing_image' => $listing->images()->first()?->url,
                'vendor_name' => $listing->vendor->business_name,
                'vendor_avatar' => $listing->vendor->logo_url,
                'messages' => $messages,
            ]);    
    }

    public function store(Request $request, Listing $listing)
    {
        $validated = $request->validate([
            'text' => ['required', 'string'],
        ]);

        $message = Message::create([
            'listing_id' => $listing->id,
            'traveller_id' => $request->user()->id,
            'sender_type' => 'guest',
            'sender_id' => $request->user()->id,
            'text' => $validated['text'],
        ]);

        $listing->vendor->notifications()->create([
            'type' => 'message',
            'title' => 'New inquiry',
            'message' => "{$request->user()->name} sent a message about \"{$listing->title}\".",
            'link' => '/vendor/messages',
        ]);

        return response()->json(['message' => $message], 201);
    }
}
