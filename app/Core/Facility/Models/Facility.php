<?php

namespace App\Core\Facility\Models;

use App\Core\Facility\Enums\FacilityOperatingStatus;
use App\Core\Facility\Enums\FacilityType;
use App\Core\Municipality\Models\Municipality;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Facility extends Model implements HasMedia
{
    use HasUlids, InteractsWithMedia, LogsActivity, SoftDeletes;

    /** Request-only delivery feedback; never persisted or exposed by public resources. */
    public string $notificationOutcome = 'not_requested';

    protected $attributes = ['is_published' => false, 'operating_status' => 'following_schedule', 'revision' => 0];

    protected $fillable = ['municipal_id', 'name', 'type', 'description', 'location_name', 'address',
        'contact_name', 'contact_phone', 'contact_email', 'is_published', 'operating_status',
        'operating_notice', 'expected_reopens_at', 'revision'];

    protected $casts = ['type' => FacilityType::class, 'operating_status' => FacilityOperatingStatus::class,
        'is_published' => 'boolean', 'expected_reopens_at' => 'immutable_datetime', 'revision' => 'integer'];

    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class, 'municipal_id');
    }

    public function weeklyDays(): HasMany
    {
        return $this->hasMany(FacilityWeeklyDay::class)->orderBy('day_of_week');
    }

    public function exceptions(): HasMany
    {
        return $this->hasMany(FacilityScheduleException::class)->orderBy('exception_date');
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(array_diff($this->fillable, ['municipal_id', 'revision']))
            ->logOnlyDirty()->dontLogEmptyChanges()->useLogName('facility');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('facility_image')->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }
}
