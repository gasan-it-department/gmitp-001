<?php

namespace App\Core\Facility\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FacilityExceptionPeriod extends Model
{
    use HasUlids;

    protected $fillable = ['municipal_id', 'exception_id', 'opening_minute', 'closing_minute'];
    protected $casts = ['opening_minute' => 'integer', 'closing_minute' => 'integer'];

    public function exception(): BelongsTo
    {
        return $this->belongsTo(FacilityScheduleException::class, 'exception_id');
    }
}
