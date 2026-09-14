<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ListingVirtualTourScene extends Model
{
    protected $fillable = ['listing_id', 'name', 'panorama_url', 'position'];

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    // Hotspots placed IN this scene, pointing to other scenes.
    public function links(): HasMany
    {
        return $this->hasMany(ListingVirtualTourLink::class, 'scene_id');
    }
}
