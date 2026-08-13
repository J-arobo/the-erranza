<?php

namespace App\Http\Controllers\Api\Admin\Concerns;

use App\Models\AuditLogEntry;
use Illuminate\Http\Request;

trait LogsAdminActions
{
    private function logAdminAction(Request $request, string $action, string $target, ?string $targetType = null, ?int $targetId = null): void
    {
        AuditLogEntry::create([
            'admin_id' => $request->user()->id,
            'action' => $action,
            'target' => $target,
            'target_type' => $targetType,
            'target_id' => $targetId,
        ]);
    }
}
