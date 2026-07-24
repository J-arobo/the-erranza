<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class VendorProfileController extends Controller
{
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
        ]);

        $vendor->update($validated);

        return response()->json(['vendor' => $vendor]);
    }

    public function completeOnboarding(Request $request)
    {
        $vendor = $request->attributes->get('vendor');

        $validated = $request->validate([
            'business_name' => ['required', 'string', 'max:255'],
            'license_number' => ['nullable', 'string', 'max:100'],
            'tax_pin' => ['nullable', 'string', 'max:50'],
            'phone' => ['required', 'string', 'max:30'],
            'payout_method' => ['required', 'in:mobile,bank'],
            'payout_details' => ['required', 'string', 'max:100'],
            'categories' => ['required', 'array', 'min:1'],
            'categories.*' => ['string'],
            'regions' => ['nullable', 'array'],
            'regions.*' => ['string'],
            'plan' => ['required', 'in:standard,plus'],
            'default_cancellation_policy' => ['required', 'in:flexible,moderate,strict'],
        ]);

        $vendor->update([
            ...$validated,
            'onboarding_complete' => true,
        ]);

        return response()->json(['vendor' => $vendor]);
    }
}
