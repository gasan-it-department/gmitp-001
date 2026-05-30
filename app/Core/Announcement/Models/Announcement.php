<?php

namespace App\Core\Announcement\Models;

use App\Core\Announcement\Enums\AnnouncementType;
use App\Core\Users\Models\User;
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

class Announcement extends Model implements HasMedia
{
    use HasFactory, HasUlids, InteractsWithMedia, LogsActivity, SoftDeletes;

    protected $table = 'announcements';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'municipal_id',
        'user_id',
        'title',
        'content',
        'type',
        'is_published',
    ];

    protected $casts = [
        'type' => AnnouncementType::class,
        'is_published' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'content', 'type', 'is_published'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('announcement');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('announcement_images')
            ->acceptsMimeTypes([
                'image/jpeg',
                'image/png',
                'image/webp',
            ]);
    }
}
