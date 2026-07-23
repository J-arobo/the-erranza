<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLogEntry;
use Illuminate\Http\Request;

class AdminAuditLogController extends Controller
{
    public function index(Request $request)
    {
        $entries = AuditLogEntry::where('admin_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(['entries' => $entries]);
    }
}
