<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Listing extends Model
{
    protected $fillable = [
        'vendor_id', 'title', 'category', 'location', 'description',
        'price', 'child_price', 'extra_guest_price', 'status',
        'min_guests', 'max_guests', 'min_lead_time_days',
        'bedrooms', 'beds', 'bathrooms', 'lat', 'lng',
        'cancellation_policy', 'custom_cancellation_text',
        'amenities', 'excluded', 'flagged', 'flag_reason', 'views',
    ];

    protected function casts(): array
    {
        return [
            'amenities' => 'array',
            'excluded' => 'array',
            'flagged' => 'boolean',
            'price' => 'decimal:2',
            'child_price' => 'decimal:2',
            'extra_guest_price' => 'decimal:2',
            'lat' => 'decimal:7',
            'lng' => 'decimal:7',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ListingImage::class)->orderBy('position');
    }

    public function itinerary(): HasMany
    {
        return $this->hasMany(ListingItineraryDay::class)->orderBy('day');
    }

    public function durationOptions(): HasMany
    {
        return $this->hasMany(ListingDurationOption::class);
    }

    public function seasonalRates(): HasMany
    {
        return $this->hasMany(ListingSeasonalRate::class);
    }

    public function groupDiscounts(): HasMany
    {
        return $this->hasMany(ListingGroupDiscount::class);
    }

    public function departures(): HasMany
    {
        return $this->hasMany(ListingDeparture::class);
    }

    public function blockedDates(): HasMany
    {
        return $this->hasMany(ListingBlockedDate::class);
    }

    public function extras(): HasMany
    {
        return $this->hasMany(ListingExtra::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
