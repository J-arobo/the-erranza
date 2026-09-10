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

        $email = $validated['email'];

        if (
            strcasecmp($vendor->email ?? '', $email) === 0 ||
            strcasecmp(optional($vendor->owner)->email ?? '', $email) === 0
        ) {
            abort(422, 'That email belongs to the business owner — they already have full access.');
        }

        $existing = $vendor->teamMembers()
            ->whereRaw('LOWER(email) = ?', [mb_strtolower($email)])
            ->first();

        if ($existing) {
            abort(422, $existing->status === 'active'
                ? "{$existing->name} is already on your team."
                : "There's already a pending invite for {$email}.");
        }

        $token = \Illuminate\Support\Str::random(40);

        $member = $vendor->teamMembers()->create([
            ...$validated,
            'status' => 'pending',
            'invite_token' => $token,
            'invite_token_expires_at' => now()->addDays(7),
        ]);

        $acceptLink = rtrim(config('app.frontend_url'), '/') . "/team-invite/{$token}";
        $inviteEmail = $validated['email'];
        defer(function () use ($inviteEmail, $member, $acceptLink) {
            try {
                \Illuminate\Support\Facades\Mail::to($inviteEmail)->send(new \App\Mail\TeamInviteMail($member, $acceptLink));
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Failed to send team invite email', ['error' => $e->getMessage()]);
            }
        });

        \App\Services\VendorChangeNotifier::notify(
            $vendor,
            'A team member was invited to your account',
            ["{$member->name} invited as {$member->role}"]
        );

        return response()->json(['member' => $member], 201);
    }

    public function destroy(Request $request, VendorTeamMember $member)
    {
        $vendor = $request->attributes->get('vendor');
        abort_unless($member->vendor_id === $vendor->id, 403);

        \App\Services\VendorChangeNotifier::notify(
            $vendor,
            'A team member was removed from your account',
            ["{$member->name} removed"]
        );

        $member->delete();

        return response()->json(['message' => 'Team member removed.']);
    }
}
