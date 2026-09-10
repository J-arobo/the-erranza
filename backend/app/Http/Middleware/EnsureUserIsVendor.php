<?php

namespace App\Http\Middleware;

use App\Models\VendorTeamMember;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsVendor
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $vendor = $user?->vendor;

        if (!$vendor && $user) {
            $membership = VendorTeamMember::where('user_id', $user->id)->where('status', 'active')->first();
            $vendor = $membership?->vendor;
        }

        if (!$vendor) {
            abort(403, 'This account has no vendor profile.');
        }

        $request->attributes->set('vendor', $vendor);

        return $next($request);
    }
}
