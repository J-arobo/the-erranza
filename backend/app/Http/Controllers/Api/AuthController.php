<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use App\Mail\AccountSecurityAlertMail;
use App\Services\VendorChangeNotifier;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Services\EmailVerificationService;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'phone' => ['nullable', 'string', 'max:30'],
            'avatar_url' => ['nullable', 'string'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'avatar_url' => $validated['avatar_url'] ?? null,
            'active_role' => 'traveller',
        ]);

        $travellerRole = Role::where('name', 'traveller')->firstOrFail();
        $user->roles()->attach($travellerRole);

        $token = $user->createToken('api-token')->plainTextToken;

        EmailVerificationService::issueLink($user);

        return response()->json([
            'user' => $this->formatUser($user),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        if ($user->suspended) {
            throw ValidationException::withMessages([
                'email' => ['This account has been suspended.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => $this->formatUser($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function verifyPassword(Request $request)
    {
        $validated = $request->validate(['password' => ['required', 'string']]);

        if (! Hash::check($validated['password'], $request->user()->password)) {
            throw ValidationException::withMessages([
                'password' => ['Incorrect password.'],
            ]);
        }

        return response()->json(['message' => 'Password verified.']);
    }

    // Change password and log out all other sessions. Send security alert email to user.
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        abort_unless(Hash::check($validated['current_password'], $user->password), 422, 'Your current password is incorrect.');

        $user->forceFill(['password' => Hash::make($validated['new_password'])])->save();

        // Whoever just typed the current password correctly is presumed to be
        // the legitimate owner right now — log every other session out.
        $currentTokenId = $request->user()->currentAccessToken()?->id;
        $user->tokens()->when($currentTokenId, fn($q) => $q->where('id', '!=', $currentTokenId))->delete();

        $this->sendSecurityAlert($user, 'Your password was changed', 'Your Erranza account password was just changed.');

        return response()->json(['message' => 'Password updated.']);
    }

    public function changeEmail(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        abort_unless(Hash::check($validated['current_password'], $user->password), 422, 'Your current password is incorrect.');

        // Doesn't swap the email yet — sends a code to the NEW address, and
        // the swap only happens once that code is confirmed via
        // verifyEmail(). The old address is deliberately left untouched
        // (and unnotified) until the new one is proven reachable.
        EmailVerificationService::issueLink($user, $validated['new_email']);

        return response()->json(['message' => 'A verification code was sent to your new email address.']);
    }

    // Send a verification code to the user's email. If the user has a pending email change, send to that address instead.
    public function sendEmailVerification(Request $request)
    {
        $user = $request->user();
        abort_if($user->email_verified_at && !$user->pending_email, 422, 'Your email is already verified.');

        EmailVerificationService::issueLink($user, $user->pending_email);

        return response()->json(['message' => 'Verification link sent.']);
    }

    // Public — consumes an email-confirmation link. No auth: whoever clicks
    // the link may not be signed in, or may be signed in as someone else.
    public function verifyEmailByToken(string $token)
    {
        abort_if(
            ! EmailVerificationService::verifyByToken($token),
            422,
            'This confirmation link is invalid or has expired.'
        );

        return response()->json(['verified' => true]);
    }

    // Let a not-yet-verified account correct a mistyped signup email without a
    // password — they're already authenticated by token, and nothing about the
    // old address was ever confirmed. Re-issues a fresh code to the new address.
    public function changeUnverifiedEmail(Request $request)
    {
        $user = $request->user();
        abort_if($user->email_verified_at, 422, 'Your email is already verified.');

        $validated = $request->validate([
            'new_email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        $user->forceFill([
            'email' => $validated['new_email'],
            'pending_email' => null,
        ])->save();

        EmailVerificationService::issueLink($user);

        return response()->json(['user' => $this->formatUser($user)]);
    }

    // Send a security alert email to the user and notify their vendor if they have one. If an override email is provided, send to that instead.
    private function sendSecurityAlert(User $user, string $subject, string $detail, ?string $overrideEmailTo = null): void
    {
        defer(function () use ($user, $overrideEmailTo, $subject, $detail) {
            try {
                Mail::to($overrideEmailTo ?? $user->email)->send(new AccountSecurityAlertMail($subject, $detail));
            } catch (\Throwable $e) {
                Log::error('Failed to send account security alert email', ['error' => $e->getMessage()]);
            }
        });

        if ($user->vendor) {
            VendorChangeNotifier::notify($user->vendor, $subject, [$detail]);
        }
    }


    public function me(Request $request)
    {
        return response()->json([
            'user' => $this->formatUser($request->user()),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'avatar_url' => ['sometimes', 'nullable', 'string'],
        ]);

        $request->user()->update($validated);

        return response()->json([
            'user' => $this->formatUser($request->user()),
        ]);
    }

    public function deleteAccount(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'password' => ['required', 'string'],
        ]);

        abort_unless(Hash::check($validated['password'], $user->password), 422, 'Your password is incorrect.');

        $activeStatuses = ['pending', 'confirmed', 'alternative_proposed'];

        if ($user->bookings()->whereIn('status', $activeStatuses)->exists()) {
            abort(422, 'You have active trips. Cancel or complete them before deleting your account.');
        }

        if ($user->vendor) {
            $hasActiveVendorBookings = \App\Models\Booking::whereIn('status', $activeStatuses)
                ->whereHas('listing', fn ($q) => $q->where('vendor_id', $user->vendor->id))
                ->exists();
            abort_if($hasActiveVendorBookings, 422, 'Your business has active bookings. Resolve them before deleting your account.');
        }

        $farewellEmail = $user->email;
        $farewellName = $user->name;

        $user->tokens()->delete();
        $user->delete();

        defer(function () use ($farewellEmail, $farewellName) {
            try {
                Mail::to($farewellEmail)->send(new \App\Mail\AccountDeletedMail($farewellName));
            } catch (\Throwable $e) {
                Log::error('Failed to send account deletion email', ['error' => $e->getMessage()]);
            }
        });

        return response()->json(['message' => 'Your account has been deleted.']);
    }

    public static function formatUser(User $user): array
    {
        $user->loadMissing('roles', 'vendor');

        $vendor = $user->vendor;
        if (!$vendor) {
            $vendor = \App\Models\VendorTeamMember::where('user_id', $user->id)
                ->where('status', 'active')
                ->with('vendor')
                ->first()?->vendor;
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'emailVerified' => $user->email_verified_at !== null,
            'pendingEmail' => $user->pending_email,
            'phone' => $user->phone,
            'avatarUrl' => $user->avatar_url,
            'roles' => $user->roles->pluck('name')->values(),
            'activeRole' => $user->active_role,
            'onboardingComplete' => $vendor?->onboarding_complete ?? false,
            'verificationStatus' => $vendor?->verification_status ?? null,
            'celebrationSeen' => $vendor?->celebration_seen_at !== null,
            // Tour
            'tourSeen' => $vendor?->tour_seen_at !== null,
            'createdAt' => $user->created_at,
        ];
    }
}
