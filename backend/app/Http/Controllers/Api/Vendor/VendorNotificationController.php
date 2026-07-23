<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\VendorNotification;
use Illuminate\Http\Request;

class VendorNotificationController extends Controller
{
    public function index(Request $request)
    {
        $vendor = $request->attributes->get('vendor');

        $notifications = $vendor->notifications()->latest()->get();

        return response()->json(['notifications' => $notifications]);
    }

    public function markRead(Request $request, VendorNotification $notification)
    {
        $vendor = $request->attributes->get('vendor');

        abort_unless($notification->vendor_id === $vendor->id, 403);

        $notification->update(['read' => true]);

        return response()->json(['notification' => $notification]);
    }

    public function markAllRead(Request $request)
    {
        $vendor = $request->attributes->get('vendor');

        $vendor->notifications()->where('read', false)->update(['read' => true]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }
}
