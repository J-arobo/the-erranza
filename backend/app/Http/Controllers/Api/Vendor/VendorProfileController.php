<?php

namespace App\Http\Controllers\Api\Vendor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class VendorProfileController extends Controller
{
    public function show(Request $request)
    {
        $vendor = $request->attributes->get('vendor')->load('owner', 'teamMembers');

        return response()->json(['vendor' => $vendor]);
    }
}
