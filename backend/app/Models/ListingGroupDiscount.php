<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ListingGroupDiscount extends Model
{
    protected $fillable = ['listing_id', 'min_guests', 'discount_percent'];

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }
}
