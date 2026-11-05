<?php

namespace App\Core\Facility\Models;

use App\Core\Facility\Enums\FacilityNoticeType;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FacilityScheduleException extends Model
{
    use HasUlids;

    protected $fillable = ['municipal_id', 'facility_id', 'exception_date', 'is_closed', 'notice_type', 'public_notice'];
    protected $casts = ['exception_date' => 'immutable_date', 'is_closed' => 'boolean', 'notice_type' => FacilityNoticeType::class];

    public function setExceptionDateAttribute(mixed $value): void
    {
        // Keep date-only storage consistent across SQLite, PostgreSQL and MySQL.
        $this->attributes['exception_date'] = CarbonImmutable::parse($value, 'Asia/Manila')->toDateString();
    }

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function periods(): HasMany
    {
        return $this->hasMany(FacilityExceptionPeriod::class, 'exception_id')->orderBy('opening_minute');
    }
}
