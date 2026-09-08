<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ListingGroupPricingTier extends Model
{
    protected $fillable = ['listing_id', 'people_count', 'total_price'];

    protected $casts = [
        'people_count' => 'integer',
        'total_price' => 'decimal:2',
    ];

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }
}
