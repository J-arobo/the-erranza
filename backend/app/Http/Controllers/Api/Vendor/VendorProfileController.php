<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VendorProfileController extends Controller
{
    private const REGIONS = [
        'Nairobi', 'Maasai Mara', 'Amboseli', 'Tsavo East', 'Tsavo West', 'Lake Nakuru',
        'Diani Beach', 'Mombasa', 'Malindi', 'Watamu', 'Lamu', 'Nanyuki', 'Naivasha',
        'Samburu', 'Meru', 'Kisumu', 'Nyeri', 'Laikipia', "Hell's Gate", 'Ol Pejeta',
    ];

    public function show(Request $request)
    {
        $vendor = $request->attributes->get('vendor')->load('owner', 'teamMembers');
        $vendor->loadCount(['reviews' => fn ($q) => $q->where('removed', false)]);
        $vendor->loadAvg(['reviews' => fn ($q) => $q->where('removed', false)], 'rating');

        return response()->json(['vendor' => $vendor]);
    }

    public function update(Request $request)
    {
        $vendor = $request->attributes->get('vendor');

        $validated = $request->validate([
            'business_name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:30'],
            'bio' => ['nullable', 'string'],
            'logo_url' => ['sometimes', 'nullable', 'string'],
            'license_number' => ['sometimes', 'nullable', 'string', 'max:100'],
            'tax_pin' => ['sometimes', 'nullable', 'string', 'regex:/^[A-Za-z]\d{9}[A-Za-z]$/'],
            'payout_method' => ['sometimes', 'in:mobile,bank'],
            'payout_bank_name' => ['sometimes', 'nullable', 'string', 'max:100'],
            'payout_details' => ['sometimes', 'string', 'max:100'],
            'categories' => ['sometimes', 'array', 'min:1'],
            'categories.*' => ['string'],
            'regions' => ['sometimes', 'array'],
            'regions.*' => ['string', Rule::in(self::REGIONS)],
        ], [
            'tax_pin.regex' => 'Enter a valid KRA PIN (e.g. P051234567X).',
        ]);               

        $vendor->update($validated);

        return response()->json(['vendor' => $vendor]);
    }

    public function markCelebrationSeen(Request $request)
    {
        $vendor = $request->attributes->get('vendor');
        $vendor->update(['celebration_seen_at' => now()]);

        return response()->json(['message' => 'OK']);
    }

    // Vendor Tour
    public function markTourSeen(Request $request)
    {
        $vendor = $request->user()->vendor;
        $vendor->update(['tour_seen_at' => now()]);

        return response()->json(['ok' => true]);
    }

    public function completeOnboarding(Request $request)
    {
        $vendor = $request->attributes->get('vendor');

        $validated = $request->validate([
            'business_name' => ['required', 'string', 'max:255'],
            'license_number' => ['nullable', 'string', 'max:100'],
            'tax_pin' => ['nullable', 'string', 'regex:/^[A-Za-z]\d{9}[A-Za-z]$/'],
            'phone' => ['required', 'string', 'max:30'],
            'payout_method' => ['required', 'in:mobile,bank'],
            'payout_bank_name' => ['required_if:payout_method,bank', 'nullable', 'string', 'max:100'],
            'payout_details' => array_filter([
                'required',
                'string',
                $request->input('payout_method') === 'mobile' ? 'regex:/^(?:\+?254|0)[17]\d{8}$/' : 'max:50',
            ]),
            'categories' => ['required', 'array', 'min:1'],
            'categories.*' => ['string'],
            'regions' => ['nullable', 'array'],
            'regions.*' => ['string', Rule::in(self::REGIONS)],
            'plan' => ['required', 'in:standard,plus'],
            'default_cancellation_policy' => ['required', 'in:flexible,moderate,strict'],
        ], [
            'tax_pin.regex' => 'Enter a valid KRA PIN (e.g. P051234567X).',
            'payout_details.regex' => 'Enter a valid M-Pesa number (e.g. 0712345678).',
        ]);

        $vendor->update([
            ...$validated,
            'onboarding_complete' => true,
        ]);

        return response()->json(['vendor' => $vendor]);
    }
}
