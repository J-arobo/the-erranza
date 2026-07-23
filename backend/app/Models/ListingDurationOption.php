<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ListingDurationOption extends Model
{
    protected $fillable = ['listing_id', 'label', 'price'];

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }
}
