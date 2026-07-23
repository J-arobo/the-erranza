<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    protected $fillable = [
        'listing_id', 'traveller_id', 'status', 'guests', 'total',
        'check_in', 'check_out', 'proposed_date',
        'refund_percent', 'refund_amount', 'special_requests',
    ];

    protected function casts(): array
    {
        return [
            'check_in' => 'date',
            'check_out' => 'date',
            'proposed_date' => 'date',
            'total' => 'decimal:2',
            'refund_amount' => 'decimal:2',
        ];
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function traveller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'traveller_id');
    }

    public function travelers(): HasMany
    {
        return $this->hasMany(BookingTraveler::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }
    // Reviews relationship
    public function review(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Review::class);
    }
    // Admin & platfom related relationships
    public function disputes(): HasMany
    {
        return $this->hasMany(Dispute::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }


}
