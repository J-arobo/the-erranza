<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingTraveler extends Model
{
    protected $fillable = ['booking_id', 'name'];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
