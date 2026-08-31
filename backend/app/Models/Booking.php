<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\BookingPayout;

class Booking extends Model
{
    protected $fillable = [
        'listing_id', 'departure_id', 'traveller_id', 'status', 'guests', 'total', 'payment_plan',
        'check_in', 'check_out', 'proposed_date', 'payment_token', 'created_by_admin',
        'company_name', 'company_tax_pin', 'billing_email', 'invoice_expires_at',
        'refund_percent', 'refund_amount', 'special_requests', 'decline_reason',
        'completion_code', 'completion_code_expires_at', 'vendor_completed_at', 'traveller_completed_at',
    ];

    protected function casts(): array
    {
        return [
            'check_in' => 'date',
            'check_out' => 'date',
            'proposed_date' => 'date',
            'total' => 'decimal:2',
            'refund_amount' => 'decimal:2',
            'invoice_expires_at' => 'datetime',
            'completion_code_expires_at' => 'datetime',
            'vendor_completed_at' => 'datetime',
            'traveller_completed_at' => 'datetime',
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

    public function departure(): BelongsTo
    {
        return $this->belongsTo(ListingDeparture::class, 'departure_id');
    }

    public function travelers(): HasMany
    {
        return $this->hasMany(BookingTraveler::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(BookingPayment::class)->orderBy('due_date');
    }
    public function payouts(): HasMany
    {
        return $this->hasMany(BookingPayout::class);
    }
    // Charges
    public function extraCharges(): HasMany
    {
        return $this->hasMany(BookingExtraCharge::class);
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
