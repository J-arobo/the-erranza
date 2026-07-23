<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ListingDeparture extends Model
{
    protected $fillable = ['listing_id', 'date', 'capacity', 'booked'];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }
}
