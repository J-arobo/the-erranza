<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLogEntry;
use Illuminate\Http\Request;

class SuperAdminAuditLogController extends Controller
{
    public function index(Request $request)
    {
        $entries = AuditLogEntry::with('admin:id,name,email')->latest()->get();

        return response()->json(['entries' => $entries]);
    }
}
