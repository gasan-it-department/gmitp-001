<?php

namespace App\Core\Facility\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FacilityWeeklyPeriod extends Model
{
    use HasUlids;

    protected $fillable = ['municipal_id', 'weekly_day_id', 'opening_minute', 'closing_minute'];
    protected $casts = ['opening_minute' => 'integer', 'closing_minute' => 'integer'];

    public function weeklyDay(): BelongsTo
    {
        return $this->belongsTo(FacilityWeeklyDay::class, 'weekly_day_id');
    }
}
