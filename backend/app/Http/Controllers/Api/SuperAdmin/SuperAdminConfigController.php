<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Api\Admin\Concerns\LogsAdminActions;
use App\Http\Controllers\Controller;
use App\Models\PlatformConfig;
use Illuminate\Http\Request;

class SuperAdminConfigController extends Controller
{
    use LogsAdminActions;

    public function show(Request $request)
    {
        return response()->json(['config' => PlatformConfig::current()]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'commission_standard' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'commission_plus' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'plus_price_monthly' => ['sometimes', 'numeric', 'min:0'],
            'default_cancellation_policy' => ['sometimes', 'in:flexible,moderate,strict'],
            'dispute_ceiling' => ['sometimes', 'integer', 'min:0'],
            'maintenance_mode' => ['sometimes', 'boolean'],
            'maintenance_message' => ['nullable', 'string'],
        ]);

        $config = PlatformConfig::current();
        $config->update($validated);

        $this->logAdminAction($request, 'updated platform config', implode(', ', array_keys($validated)));

        return response()->json(['config' => $config]);
    }
}
