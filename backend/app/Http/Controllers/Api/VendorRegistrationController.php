<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;

class VendorRegistrationController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        abort_if($user->vendor, 422, 'This account already has a vendor profile.');

        $vendor = $user->vendor()->create([
            'business_name' => "{$user->name}'s Business",
            'email' => $user->email,
            'verification_status' => 'pending',
        ]);

        $partnerRole = Role::where('name', 'partner')->firstOrFail();
        $user->roles()->syncWithoutDetaching($partnerRole);
        $user->update(['active_role' => 'partner']);

        return response()->json(['vendor' => $vendor], 201);
    }
}
