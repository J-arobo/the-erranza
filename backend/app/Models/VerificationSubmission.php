<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class VerificationSubmission extends Model
{
    protected $fillable = [
        'vendor_id', 'doc_type', 'file_url', 'expiry_date', 'status', 'rejection_reason', 'reviewed_by', 'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'expiry_date' => 'date',
            'reviewed_at' => 'datetime',
        ];
    }

    // The DB column stores a relative storage path (set by the controller); this accessor returns a full URL to the file in public storage.
    protected function fileUrl(): Attribute
    {
        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        return Attribute::make(
            get: fn (?string $value) => $value ? $disk->url($value) : null,
        );
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
