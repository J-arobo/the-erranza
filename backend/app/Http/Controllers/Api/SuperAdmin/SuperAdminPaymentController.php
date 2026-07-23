<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SuperAdminPaymentController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'providers' => [
                ['name' => 'Paystack', 'configured' => filled(env('PAYSTACK_SECRET_KEY'))],
                ['name' => 'Flutterwave', 'configured' => filled(env('FLUTTERWAVE_SECRET_KEY'))],
                ['name' => 'M-Pesa', 'configured' => filled(env('MPESA_CONSUMER_SECRET'))],
            ],
            'note' => 'Provider credentials live in server environment variables, not the database, and are never exposed via this API.',
        ]);
    }
}
