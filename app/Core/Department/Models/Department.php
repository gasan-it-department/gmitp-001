<?php

namespace App\Core\Department\Models;

use App\Core\Municipality\Models\Municipality;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Department extends Model implements HasMedia
{
    use HasFactory, HasUlids, InteractsWithMedia, LogsActivity, SoftDeletes;

    protected $table = 'departments';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'municipal_id',
        'name',
        'code',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class, 'municipal_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'code', 'description', 'is_active'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('department');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('department_logo')
            ->singleFile()
            ->useDisk('s3')
            ->acceptsMimeTypes([
                'image/jpeg',
                'image/png',
                'image/webp',
            ]);
    }
}
