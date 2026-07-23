<?php

namespace App\Http\Controllers\Api\Admin\Concerns;

use App\Models\AuditLogEntry;
use Illuminate\Http\Request;

trait LogsAdminActions
{
    private function logAdminAction(Request $request, string $action, string $target): void
    {
        AuditLogEntry::create([
            'admin_id' => $request->user()->id,
            'action' => $action,
            'target' => $target,
        ]);
    }
}
