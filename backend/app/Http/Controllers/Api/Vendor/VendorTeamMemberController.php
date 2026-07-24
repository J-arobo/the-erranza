<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use App\Models\VendorTeamMember;
use Illuminate\Http\Request;

class VendorTeamMemberController extends Controller
{
    public function store(Request $request)
    {
        $vendor = $request->attributes->get('vendor');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'role' => ['required', 'in:Manager,Co-host,Support'],
        ]);

        $member = $vendor->teamMembers()->create([
            ...$validated,
            'status' => 'pending',
        ]);

        return response()->json(['member' => $member], 201);
    }

    public function destroy(Request $request, VendorTeamMember $member)
    {
        abort_unless($member->vendor_id === $request->attributes->get('vendor')->id, 403);

        $member->delete();

        return response()->json(['message' => 'Team member removed.']);
    }
}
