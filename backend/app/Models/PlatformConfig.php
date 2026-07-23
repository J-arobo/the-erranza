<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformConfig extends Model
{
    protected $fillable = [
        'commission_standard', 'commission_plus', 'plus_price_monthly',
        'default_cancellation_policy', 'dispute_ceiling',
        'maintenance_mode', 'maintenance_message',
    ];

    protected function casts(): array
    {
        return [
            'maintenance_mode' => 'boolean',
            'plus_price_monthly' => 'decimal:2',
        ];
    }

    public static function current(): self
    {
        return static::firstOrCreate(['id' => 1]);
    }
}
