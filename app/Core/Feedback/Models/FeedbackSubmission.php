<?php

namespace App\Core\Feedback\Models;

use App\Core\Department\Models\Department;
use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class FeedbackSubmission extends Model implements HasMedia
{
    use HasFactory, HasUlids, InteractsWithMedia, LogsActivity, SoftDeletes;

    protected $table = 'feedback_submissions';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'municipal_id',
        'department_id',
        'user_id',
        'citizen_name',
        'contact_number',
        'email',
        'employee_name',
        'subject',
        'message',
        'rating',
        'is_anonymous',
    ];

    protected $casts = [
        'citizen_name' => 'encrypted',
        'contact_number' => 'encrypted',
        'email' => 'encrypted',
        'rating' => 'integer',
        'is_anonymous' => 'boolean',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'subject',
                'message',
                'rating',
                'department_id',
                'employee_name',
                'is_anonymous',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('feedback_submission');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('attachments')
            ->acceptsMimeTypes([
                'image/jpeg',
                'image/png',
                'video/mp4',
                'video/avi',
                'video/mpeg',
            ]);
    }

    public function registerMediaConversions(\Spatie\MediaLibrary\MediaCollections\Models\Media $media = null): void
    {
        $this->addMediaConversion('optimized_logo')
            ->performOnCollections('attachments')
            ->width(400)
            ->format('webp')
            ->quality(90)
            ->nonQueued();
    }
}
