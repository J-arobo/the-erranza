<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MpesaPayoutVerification extends Model
{
    protected $fillable = [
        'vendor_id', 'phone', 'amount', 'checkout_request_id', 'merchant_request_id',
        'status', 'mpesa_receipt_number', 'result_desc',
        'refund_status', 'refund_conversation_id', 'refund_receipt_number', 'refunded_at',
    ];

    protected function casts(): array
    {
        return [
            'refunded_at' => 'datetime',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
}
