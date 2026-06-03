<?php

namespace App\Core\Event\Models;

use App\Core\Event\Enums\EventType;
use App\Core\Municipality\Models\Municipality;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Event extends Model implements HasMedia
{
    use HasFactory, HasUlids, InteractsWithMedia, LogsActivity, SoftDeletes;

    protected $table = 'events';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'municipal_id',
        'title',
        'description',
        'type',
        'start_datetime',
        'end_datetime',
        'location_name',
        'is_published',
    ];

    protected $casts = [
        'type' => EventType::class,
        'is_published' => 'boolean',
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
    ];

    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class, 'municipal_id');
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'title',
                'description',
                'type',
                'is_published',
                'start_datetime',
                'end_datetime',
                'location_name',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('event');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('event_banner')
            ->singleFile()
            ->acceptsMimeTypes([
                'image/jpeg',
                'image/png',
                'image/webp',
            ]);
    }

    public function registerMediaConversions(?\Spatie\MediaLibrary\MediaCollections\Models\Media $media = null): void
    {
        $this->addMediaConversion('optimized')
            ->width(1200)
            ->format('webp')
            ->quality(80)
            ->nonQueued();
    }
}
