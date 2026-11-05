<?php

namespace App\Core\Facility\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FacilityWeeklyDay extends Model
{
    use HasUlids;

    protected $fillable = ['municipal_id', 'facility_id', 'day_of_week', 'is_closed'];
    protected $casts = ['day_of_week' => 'integer', 'is_closed' => 'boolean'];

    public function facility(): BelongsTo
    {
        return $this->belongsTo(Facility::class);
    }

    public function periods(): HasMany
    {
        return $this->hasMany(FacilityWeeklyPeriod::class, 'weekly_day_id')->orderBy('opening_minute');
    }
}
