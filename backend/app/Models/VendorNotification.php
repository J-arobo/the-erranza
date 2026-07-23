<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorNotification extends Model
{
    protected $table = 'vendor_notifications';

    protected $fillable = ['vendor_id', 'type', 'title', 'message', 'link', 'read'];

    protected function casts(): array
    {
        return [
            'read' => 'boolean',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
}
