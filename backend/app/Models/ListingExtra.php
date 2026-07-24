<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ListingExtra extends Model
{
    protected $fillable = ['listing_id', 'label', 'price', 'default_selected'];

    protected function casts(): array
    {
        return [
            'default_selected' => 'boolean',
        ];
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }
}
