<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VendorTeamMember extends Model
{
    protected $fillable = [
        'vendor_id', 'user_id', 'name', 'email', 'role', 'status',
        'invite_token', 'invite_token_expires_at',
    ];

    protected function casts(): array
    {
        return ['invite_token_expires_at' => 'datetime'];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
