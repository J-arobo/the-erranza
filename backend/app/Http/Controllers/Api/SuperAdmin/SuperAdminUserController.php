<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Api\Admin\Concerns\LogsAdminActions;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class SuperAdminUserController extends Controller
{
    use LogsAdminActions;

    public function index(Request $request)
    {
        $users = User::with('roles:id,name')->latest()->get();

        return response()->json(['users' => $users]);
    }

    public function suspend(Request $request, User $user)
    {
        abort_if($user->hasRole('super_admin'), 403, 'Cannot suspend a super admin account.');

        $validated = $request->validate([
            'reason' => ['required', 'string'],
        ]);

        $user->update([
            'suspended' => true,
            'suspend_reason' => $validated['reason'],
        ]);

        $this->logAdminAction($request, 'suspended account', "{$user->name} ({$user->email}) — {$validated['reason']}");

        return response()->json(['user' => $user]);
    }

    public function reinstate(Request $request, User $user)
    {
        $user->update([
            'suspended' => false,
            'suspend_reason' => null,
        ]);

        $this->logAdminAction($request, 'reinstated account', "{$user->name} ({$user->email})");

        return response()->json(['user' => $user]);
    }

    public function destroy(Request $request, User $user)
    {
        abort_if($user->hasRole('super_admin'), 403, 'Cannot delete a super admin account.');

        $validated = $request->validate([
            'confirm_email' => ['required', 'string'],
        ]);

        abort_unless($validated['confirm_email'] === $user->email, 422, 'Confirmation email does not match.');

        $name = $user->name;
        $email = $user->email;

        $user->delete();

        $this->logAdminAction($request, 'permanently deleted account', "{$name} ({$email})");

        return response()->json(['message' => 'Account permanently deleted.']);
    }
}
