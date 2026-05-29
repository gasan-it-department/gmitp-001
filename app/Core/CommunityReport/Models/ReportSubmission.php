<?php

namespace App\Core\CommunityReport\Models;

use App\Core\CommunityReport\Enums\ReportCategory;
use App\Core\CommunityReport\Enums\ReportStatus;
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

class ReportSubmission extends Model implements HasMedia
{
    use HasFactory, HasUlids, InteractsWithMedia, LogsActivity, SoftDeletes;

    protected $table = 'report_submissions';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'municipal_id',
        'user_id',
        'category',
        'status',
        'location_text',
        'latitude',
        'longitude',
        'description',
        'is_anonymous',
        'reviewed_at',
        'in_progress_at',
        'resolved_at',
        'rejected_at',
    ];

    protected $casts = [
        'category' => ReportCategory::class,
        'status' => ReportStatus::class,
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'is_anonymous' => 'boolean',
        'reviewed_at' => 'datetime',
        'in_progress_at' => 'datetime',
        'resolved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'category',
                'status',
                'description',
                'location_text',
                'reviewed_at',
                'in_progress_at',
                'resolved_at',
                'rejected_at',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('report_submission');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('evidence_photos')
            ->useDisk('s3')
            ->acceptsMimeTypes([
                'image/jpeg',
                'image/png',
                'image/webp',
            ]);
    }
}
