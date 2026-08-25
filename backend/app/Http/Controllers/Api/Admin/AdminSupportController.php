<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use App\Models\Vendor;
use App\Services\SupportMessenger;
use Illuminate\Http\Request;

class AdminSupportController extends Controller
{
    public function index(Request $request)
    {
        $support = SupportMessenger::supportUser();
        $supportVendor = SupportMessenger::supportVendor();

        $vendorIds = Message::where('traveller_id', $support->id)
            ->where('vendor_id', '!=', $supportVendor->id)
            ->select('vendor_id')->distinct()->pluck('vendor_id');

        $travellerIds = Message::where('vendor_id', $supportVendor->id)
            ->select('traveller_id')->distinct()->pluck('traveller_id');

        $vendorThreads = $vendorIds->map(function ($vendorId) use ($support) {
            $vendor = Vendor::find($vendorId);
            if (! $vendor) return null;

            $last = Message::where('vendor_id', $vendorId)->where('traveller_id', $support->id)->latest()->first();

            return [
                'type' => 'vendor',
                'id' => $vendor->id,
                'name' => $vendor->business_name,
                'last_message' => $last?->text,
                'last_message_at' => $last?->created_at,
                'awaiting_reply' => $last && $last->sender_id !== $support->id,
            ];
        })->filter()->values();

        $travellerThreads = $travellerIds->map(function ($travellerId) use ($support, $supportVendor) {
            $traveller = User::find($travellerId);
            if (! $traveller) return null;

            $last = Message::where('vendor_id', $supportVendor->id)->where('traveller_id', $travellerId)->latest()->first();

            return [
                'type' => 'traveller',
                'id' => $traveller->id,
                'name' => $traveller->name,
                'last_message' => $last?->text,
                'last_message_at' => $last?->created_at,
                'awaiting_reply' => $last && $last->sender_id !== $support->id,
            ];
        })->filter()->values();

        $bookingsVendor = SupportMessenger::bookingsVendor();
        $bookingTravellerIds = Message::where('vendor_id', $bookingsVendor->id)
            ->select('traveller_id')->distinct()->pluck('traveller_id');

        $bookingThreads = $bookingTravellerIds->map(function ($travellerId) use ($bookingsVendor) {
            $traveller = User::find($travellerId);
            if (! $traveller) return null;

            $last = Message::where('vendor_id', $bookingsVendor->id)->where('traveller_id', $travellerId)->latest()->first();

            return [
                'type' => 'booking',
                'id' => $traveller->id,
                'name' => $traveller->name,
                'last_message' => $last?->text,
                'last_message_at' => $last?->created_at,
                'awaiting_reply' => false,
            ];
        })->filter()->values();

        $threads = $vendorThreads->concat($travellerThreads)->concat($bookingThreads)->sortByDesc('last_message_at')->values();

        return response()->json(['threads' => $threads]);
    }

    public function vendorThread(Request $request, Vendor $vendor)
    {
        $support = SupportMessenger::supportUser();

        $messages = Message::where('vendor_id', $vendor->id)->where('traveller_id', $support->id)
            ->with('sender:id,name')
            ->oldest()->get();

        return response()->json([
            'type' => 'vendor',
            'id' => $vendor->id,
            'name' => $vendor->business_name,
            'messages' => $messages,
        ]);
    }

    public function travellerThread(Request $request, User $traveller)
    {
        $supportVendor = SupportMessenger::supportVendor();

        $messages = Message::where('vendor_id', $supportVendor->id)->where('traveller_id', $traveller->id)
            ->with('sender:id,name')
            ->oldest()->get();

        return response()->json([
            'type' => 'traveller',
            'id' => $traveller->id,
            'name' => $traveller->name,
            'messages' => $messages,
        ]);
    }

    public function bookingThread(Request $request, User $traveller)
    {
        $bookingsVendor = SupportMessenger::bookingsVendor();

        $messages = Message::where('vendor_id', $bookingsVendor->id)->where('traveller_id', $traveller->id)
            ->with('sender:id,name')
            ->oldest()->get();

        return response()->json([
            'type' => 'booking',
            'id' => $traveller->id,
            'name' => $traveller->name,
            'messages' => $messages,
        ]);
    }

    public function replyToBooking(Request $request, User $traveller)
    {
        $validated = $request->validate(['text' => ['required', 'string']]);
        $message = SupportMessenger::sendBookingNotice($traveller, $validated['text']);
        $message->load('sender:id,name');

        return response()->json(['message' => $message], 201);
    }

    public function replyToVendor(Request $request, Vendor $vendor)
    {
        $validated = $request->validate(['text' => ['required', 'string']]);
        $message = SupportMessenger::sendToVendor($vendor, $validated['text']);
        $message->load('sender:id,name');

        return response()->json(['message' => $message], 201);
    }

    public function replyToTraveller(Request $request, User $traveller)
    {
        $validated = $request->validate(['text' => ['required', 'string']]);
        $message = SupportMessenger::sendToTraveller($traveller, $validated['text']);
        $message->load('sender:id,name');

        return response()->json(['message' => $message], 201);
    }
}
