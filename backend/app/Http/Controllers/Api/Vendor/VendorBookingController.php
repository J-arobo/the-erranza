<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class VendorBookingController extends Controller
{
    public function index(Request $request)
    {
        $vendor = $request->attributes->get('vendor');

        $bookings = Booking::whereHas('listing', fn ($q) => $q->where('vendor_id', $vendor->id))
            ->with([
                'listing:id,title,category,vendor_id,cancellation_policy,custom_cancellation_text',
                'listing.images',
                'traveller:id,name,email',
                'travelers',
            ])
            ->latest()
            ->get();

        return response()->json(['bookings' => $bookings]);
    }

    public function show(Request $request, Booking $booking)
    {
        $this->authorizeOwnership($request, $booking);

        $booking->load(['listing', 'listing.images', 'traveller', 'travelers', 'messages.sender']);

        return response()->json(['booking' => $booking]);
    }
    public function accept(Request $request, Booking $booking)
    {
        $this->authorizeOwnership($request, $booking);

        abort_unless($booking->status === 'pending', 422, 'Only pending bookings can be accepted.');

        $booking->update(['status' => 'confirmed']);

        return response()->json(['booking' => $booking]);
    }

    public function decline(Request $request, Booking $booking)
    {
        $this->authorizeOwnership($request, $booking);

        abort_unless($booking->status === 'pending', 422, 'Only pending bookings can be declined.');

        $booking->update(['status' => 'cancelled']);

        return response()->json(['booking' => $booking]);
    }

    public function proposeDates(Request $request, Booking $booking)
    {
        $this->authorizeOwnership($request, $booking);

        $validated = $request->validate([
            'proposed_date' => ['required', 'date'],
        ]);

        $booking->update([
            'status' => 'alternative_proposed',
            'proposed_date' => $validated['proposed_date'],
        ]);

        return response()->json(['booking' => $booking]);
    }

    public function cancel(Request $request, Booking $booking)
    {
        $this->authorizeOwnership($request, $booking);

        $validated = $request->validate([
            'refund_percent' => ['required', 'integer', 'min:0', 'max:100'],
        ]);

        $booking->update([
            'status' => 'cancelled',
            'refund_percent' => $validated['refund_percent'],
            'refund_amount' => round($booking->total * $validated['refund_percent'] / 100, 2),
        ]);

        return response()->json(['booking' => $booking]);
    }

    private function authorizeOwnership(Request $request, Booking $booking): void
    {
        $vendor = $request->attributes->get('vendor');

        abort_unless($booking->listing->vendor_id === $vendor->id, 403);
    }
}
