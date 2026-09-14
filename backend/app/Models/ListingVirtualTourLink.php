<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ListingVirtualTourLink extends Model
{
    protected $fillable = ['scene_id', 'target_scene_id', 'yaw', 'pitch'];

    protected function casts(): array
    {
        return [
            'yaw' => 'float',
            'pitch' => 'float',
        ];
    }

    public function scene(): BelongsTo
    {
        return $this->belongsTo(ListingVirtualTourScene::class, 'scene_id');
    }

    public function targetScene(): BelongsTo
    {
        return $this->belongsTo(ListingVirtualTourScene::class, 'target_scene_id');
    }
}
