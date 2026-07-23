<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ListingItineraryDay extends Model
{
    protected $fillable = ['listing_id', 'day', 'title', 'description'];

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }
}
