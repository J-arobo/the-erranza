<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class AdminBookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::with([
            'listing:id,title,vendor_id',
            'listing.vendor:id,business_name',
            'traveller:id,name,email',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('vendor_id')) {
            $query->whereHas('listing', fn ($q) => $q->where('vendor_id', $request->integer('vendor_id')));
        }

        $bookings = $query->latest()->paginate(25);

        return response()->json($bookings);
    }
}
