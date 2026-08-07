<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MpesaStkRequest extends Model
{
    protected $fillable = [
        'traveller_id', 'listing_id', 'guests', 'check_in', 'check_out', 'departure_id',
        'special_requests', 'phone', 'amount', 'checkout_request_id', 'merchant_request_id',
        'status', 'mpesa_receipt_number', 'result_desc', 'booking_id',
    ];

    protected function casts(): array
    {
        return [
            'check_in' => 'date',
            'check_out' => 'date',
            'amount' => 'decimal:2',
        ];
    }

    public function traveller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'traveller_id');
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
