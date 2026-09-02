<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BuniController extends Controller
{
    /**
     * Async transaction notifications from KCB Buni.
     * Stays public (no auth middleware) and must return 200 quickly
     * so Buni doesn't keep retrying.
     */
    public function callback(Request $request)
    {
        Log::info('Buni callback raw payload', [
            'headers' => $request->headers->all(),
            'body'    => $request->all(),
        ]);

        // TODO: verify the request is genuinely from KCB — e.g. a shared
        // secret you set on the Buni portal, or a Basic Auth header:
        // abort_unless(
        //     hash_equals((string) config('services.buni.callback_secret'), (string) $request->header('X-Callback-Secret')),
        //     401
        // );

        // TODO: look up your payment/transaction by the reference Buni sends
        // (field name per their docs, e.g. transactionReference / billRefNumber)
        // and mark it paid/failed.

        return response()->json(['status' => 'received'], 200);
    }
}
