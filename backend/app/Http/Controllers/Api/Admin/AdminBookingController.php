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
            'traveller:id,name,email,avatar_url',
            'payments',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('vendor_id')) {
            $query->whereHas('listing', fn($q) => $q->where('vendor_id', $request->integer('vendor_id')));
        }

        $bookings = $query->latest()->paginate(25);

        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'listing_id' => ['required', 'exists:listings,id'],
            'guests' => ['required', 'integer', 'min:1'],
            'check_in' => ['nullable', 'date'],
            'check_out' => ['nullable', 'date'],
            'total' => ['required', 'numeric', 'min:0'],
            'special_requests' => ['nullable', 'string'],
            'traveller_id' => ['nullable', 'exists:users,id'],
            'traveller_name' => ['required_without:traveller_id', 'string', 'max:255'],
            'traveller_email' => ['required_without:traveller_id', 'email'],
            'traveller_phone' => ['nullable', 'string', 'max:30'],
            'payment_method' => ['required', 'in:mark_paid,invoice'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'company_tax_pin' => ['nullable', 'string', 'max:20'],
            'billing_email' => ['nullable', 'email'],
        ]);

        $traveller = ($validated['traveller_id'] ?? null)
            ? \App\Models\User::findOrFail($validated['traveller_id'])
            : \App\Models\User::firstOrCreate(
                ['email' => $validated['traveller_email']],
                [
                    'name' => $validated['traveller_name'],
                    'phone' => $validated['traveller_phone'] ?? null,
                    'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(40)),
                ]
            );
        $booking = \App\Models\Booking::create([
            'listing_id' => $validated['listing_id'],
            'traveller_id' => $traveller->id,
            'status' => 'pending',
            'guests' => $validated['guests'],
            'total' => $validated['total'],
            'payment_plan' => 'full',
            'check_in' => $validated['check_in'] ?? null,
            'check_out' => $validated['check_out'] ?? null,
            'special_requests' => $validated['special_requests'] ?? null,
            'created_by_admin' => true,
            'payment_token' => \Illuminate\Support\Str::random(40),
            'company_name' => $validated['company_name'] ?? null,
            'company_tax_pin' => $validated['company_tax_pin'] ?? null,
            'billing_email' => $validated['billing_email'] ?? null,
            'invoice_expires_at' => $validated['payment_method'] === 'invoice' ? now()->addDays(7) : null,
        ]);

        if ($validated['payment_method'] === 'mark_paid') {
            $booking->payments()->create([
                'amount' => $validated['total'],
                'due_date' => now()->toDateString(),
                'status' => 'paid',
                'paid_at' => now(),
                'paystack_reference' => 'admin_marked_paid',
            ]);
            \App\Services\BookingNotifier::notifyPaid($booking);
        } else {
            $booking->payments()->create([
                'amount' => $validated['total'],
                'due_date' => now()->toDateString(),
                'status' => 'pending',
            ]);

            $paymentLink = rtrim(config('app.frontend_url'), '/') . "/pay/{$booking->payment_token}";

            try {
                \Illuminate\Support\Facades\Mail::to($traveller->email)
                    ->send(new \App\Mail\BookingInvoiceMail($booking->load('listing'), $paymentLink));
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Failed to send invoice email', ['error' => $e->getMessage()]);
            }

            return response()->json(['booking' => $booking, 'payment_link' => $paymentLink], 201);
        }


        return response()->json(['booking' => $booking], 201);
    }

    // Searching Endpoints
    public function searchTravellers(Request $request)
    {
        $search = $request->string('search');
        abort_if(!$search, 422, 'Enter a search term.');

        $users = \App\Models\User::where('name', 'like', "%{$search}%")
            ->orWhere('email', 'like', "%{$search}%")
            ->limit(10)
            ->get(['id', 'name', 'email']);

        return response()->json(['users' => $users]);
    }

}
