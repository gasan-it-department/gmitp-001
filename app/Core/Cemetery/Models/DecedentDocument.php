<?php

namespace App\Core\Cemetery\Models;

use App\Core\Cemetery\Enums\DecedentDocumentType;
use App\Core\Cemetery\Traits\BelongsToMunicipality;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class DecedentDocument extends Model implements HasMedia
{
    use BelongsToMunicipality, InteractsWithMedia, LogsActivity, SoftDeletes;

    protected $table = 'cemetery_decedent_documents';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id', 'municipal_id', 'decedent_id', 'type', 'document_number',
        'issued_at', 'notes',
    ];

    protected $casts = [
        'type' => DecedentDocumentType::class,
        'issued_at' => 'date',
    ];

    public function decedent(): BelongsTo
    {
        return $this->belongsTo(Decedent::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('file')
            ->singleFile()
            ->useDisk('local')
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['type', 'document_number', 'issued_at', 'notes'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('cemetery_decedent_document');
    }
}
