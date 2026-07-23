<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Api\Admin\Concerns\LogsAdminActions;
use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;

class SuperAdminAdminController extends Controller
{
    use LogsAdminActions;

    public function index(Request $request)
    {
        $admins = User::whereHas('roles', fn ($q) => $q->whereIn('name', ['admin', 'super_admin']))
            ->with('roles:id,name')
            ->get();

        return response()->json(['admins' => $admins]);
    }

    public function promote(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        $user = User::where('email', $validated['email'])->firstOrFail();
        $adminRole = Role::where('name', 'admin')->firstOrFail();

        $user->roles()->syncWithoutDetaching($adminRole);

        $this->logAdminAction($request, 'promoted to admin', "{$user->name} ({$user->email})");

        return response()->json(['user' => $user->load('roles:id,name')]);
    }

    public function promoteSuper(Request $request, User $user)
    {
        $superRole = Role::where('name', 'super_admin')->firstOrFail();

        $user->roles()->syncWithoutDetaching($superRole);

        $this->logAdminAction($request, 'promoted to super admin', "{$user->name} ({$user->email})");

        return response()->json(['user' => $user->load('roles:id,name')]);
    }

    public function revoke(Request $request, User $user)
    {
        abort_if($user->id === $request->user()->id, 422, 'You cannot revoke your own access.');

        $adminRole = Role::where('name', 'admin')->first();
        $user->roles()->detach($adminRole);

        $this->logAdminAction($request, 'revoked admin access', "{$user->name} ({$user->email})");

        return response()->json(['user' => $user->load('roles:id,name')]);
    }
}
