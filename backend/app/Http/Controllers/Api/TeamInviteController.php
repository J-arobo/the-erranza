<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Models\VendorTeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TeamInviteController extends Controller
{
    private function findValidInvite(string $token): VendorTeamMember
    {
        $member = VendorTeamMember::where('invite_token', $token)->first();
        abort_if(!$member, 404, 'This invite link is invalid.');
        abort_if($member->status === 'active', 422, 'This invite has already been accepted.');
        abort_if($member->invite_token_expires_at && $member->invite_token_expires_at->isPast(), 422, 'This invite has expired.');

        return $member;
    }

    // Public — lets the accept page show who invited them and whether an
    // account already exists for that email before deciding which form to show.
    public function show(string $token)
    {
        $member = $this->findValidInvite($token);
        $member->loadMissing('vendor:id,business_name');

        return response()->json([
            'name' => $member->name,
            'email' => $member->email,
            'role' => $member->role,
            'business_name' => $member->vendor->business_name,
            'has_account' => User::where('email', $member->email)->exists(),
        ]);
    }

    // Public — for an invitee with no existing Erranza account: creates one
    // and accepts the invite in the same step, logging them straight in.
    // Gets both the traveller and partner roles (like a normal vendor signup)
    // so they land on the vendor dashboard, not the "become a partner" pitch.
    public function registerAndAccept(Request $request, string $token)
    {
        $member = $this->findValidInvite($token);
        abort_if(User::where('email', $member->email)->exists(), 422, 'An account already exists for this email — please log in instead.');

        $validated = $request->validate([
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $user = User::create([
            'name' => $member->name,
            'email' => $member->email,
            'password' => Hash::make($validated['password']),
            'active_role' => 'partner',
            'email_verified_at' => now(), // invited by email link — the address is already proven reachable
        ]);

        $user->roles()->attach(
            Role::whereIn('name', ['traveller', 'partner'])->pluck('id')
        );

        $member->update([
            'user_id' => $user->id,
            'status' => 'active',
            'invite_token' => null,
            'invite_token_expires_at' => null,
        ]);

        $plainTextToken = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => AuthController::formatUser($user),
            'token' => $plainTextToken,
            'vendor_id' => $member->vendor_id,
        ]);
    }

    // Authenticated — for an invitee who already has an Erranza account:
    // logs in normally first, then hits this to link that account to the invite.
    public function link(Request $request, string $token)
    {
        $member = $this->findValidInvite($token);
        $user = $request->user();

        abort_unless(strcasecmp($user->email, $member->email) === 0, 403, 'This invite was sent to a different email address.');

        $member->update([
            'user_id' => $user->id,
            'status' => 'active',
            'invite_token' => null,
            'invite_token_expires_at' => null,
        ]);

        $user->roles()->syncWithoutDetaching(
            Role::where('name', 'partner')->pluck('id')
        );

        // The invite link was emailed to this exact address, so clicking it
        // proves the address is reachable — same standard as a fresh signup.
        if (!$user->email_verified_at) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }
        if ($user->active_role !== 'partner') {
            $user->forceFill(['active_role' => 'partner'])->save();
        }

        return response()->json([
            'user' => AuthController::formatUser($user->fresh()),
            'vendor_id' => $member->vendor_id,
        ]);
    }
}
