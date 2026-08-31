<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingExtraCharge extends Model
{
    protected $fillable = [
        'booking_id', 'vendor_id', 'amount', 'description', 'status',
        'checkout_request_id', 'merchant_request_id', 'decided_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'decided_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
}
