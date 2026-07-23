<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vendor extends Model
{
    protected $fillable = [
        'user_id', 'business_name', 'email', 'phone', 'bio', 'logo_url',
        'verification_status', 'suspended', 'suspend_reason',
    ];

    protected function casts(): array
    {
        return [
            'suspended' => 'boolean',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function teamMembers(): HasMany
    {
        return $this->hasMany(VendorTeamMember::class);
    }

    public function verificationSubmissions(): HasMany
    {
        return $this->hasMany(VerificationSubmission::class);
    }
    // Add a relationship to the Listing model
    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class);
    }
    // Reviews relationship
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
    // Admin & Platform ops relationship
    public function notifications(): HasMany
    {
        return $this->hasMany(VendorNotification::class);
    }



}
