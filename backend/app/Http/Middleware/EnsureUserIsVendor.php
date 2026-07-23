<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsVendor
{
    public function handle(Request $request, Closure $next): Response
    {
        $vendor = $request->user()?->vendor;

        if (! $vendor) {
            abort(403, 'This account has no vendor profile.');
        }

        $request->attributes->set('vendor', $vendor);

        return $next($request);
    }
}
