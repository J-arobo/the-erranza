<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\TripCompletionCodeMail;
use App\Models\Booking;
use App\Services\SupportMessenger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class BookingCompletionController extends Controller
{
    // Either the traveller or the vendor on this booking can kick off
    // completion — whoever gets there first. Only the vendor ever enters
    // the code back (see confirm() below), so this doesn't need to know
    // which side called it.
    public function initiate(Request $request, Booking $booking)
    {
        $this->authorizeParty($request, $booking);
        abort_unless($booking->status === 'confirmed', 422, 'Only a confirmed booking can be completed.');

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $booking->update([
            'completion_code' => Hash::make($code),
            'completion_code_expires_at' => now()->addHours(24),
        ]);

        $booking->loadMissing('traveller', 'listing');

        try {
            Mail::to($booking->billing_email ?? $booking->traveller->email)
                ->send(new TripCompletionCodeMail($booking, $code));
        } catch (\Throwable $e) {
            Log::error('Failed to send trip completion code email', ['error' => $e->getMessage()]);
        }

        try {
            SupportMessenger::sendBookingNotice(
                $booking->traveller,
                "Your trip completion code for \"{$booking->listing->title}\" is {$code}. Give this to your host when the trip wraps up — it's how they confirm you were there and close out the booking. Valid for 24 hours.",
                $booking->listing_id
            );
        } catch (\Throwable $e) {
            Log::error('Failed to post completion-code booking notice', ['error' => $e->getMessage()]);
        }

        return response()->json(['ok' => true, 'expires_at' => $booking->completion_code_expires_at]);
    }

    // Vendor-only. Entering the code correctly stands in for both sides —
    // the traveller could only have given it to the vendor by having
    // actually received it, so this is the single moment both completion
    // timestamps get stamped together.
    public function confirm(Request $request, Booking $booking)
    {
        $vendor = $request->attributes->get('vendor');
        abort_unless($vendor && $booking->listing->vendor_id === $vendor->id, 403);
        abort_unless($booking->status === 'confirmed', 422, 'Only a confirmed booking can be completed.');

        $validated = $request->validate(['code' => ['required', 'string']]);

        abort_if(!$booking->completion_code, 422, 'No completion code has been requested for this booking yet.');
        abort_if($booking->completion_code_expires_at?->isPast(), 422, 'This code has expired — ask the guest to request a new one.');
        abort_unless(Hash::check($validated['code'], $booking->completion_code), 422, 'That code doesn\'t match. Double-check with your guest.');

        $booking->update([
            'status' => 'completed',
            'vendor_completed_at' => now(),
            'traveller_completed_at' => now(),
            'completion_code' => null,
            'completion_code_expires_at' => null,
        ]);

        \App\Services\BookingPayoutService::process($booking);


        return response()->json(['booking' => $booking->fresh()]);
    }

    private function authorizeParty(Request $request, Booking $booking): void
    {
        $user = $request->user();
        $vendor = $user->vendor;

        $isTraveller = $booking->traveller_id === $user->id;
        $isVendor = $vendor && $booking->listing->vendor_id === $vendor->id;

        abort_unless($isTraveller || $isVendor, 403);
    }

}
