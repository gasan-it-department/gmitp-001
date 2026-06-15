<?php

namespace App\Core\Cemetery\Models;

use App\Core\Cemetery\Enums\DecedentDocumentType;
use App\Core\Cemetery\Enums\DocumentVerificationStatus;
use App\Core\Cemetery\Traits\BelongsToMunicipality;
use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
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
        'id', 'municipal_id', 'decedent_id', 'supersedes_id', 'type', 'document_number',
        'issued_at', 'notes', 'verification_status', 'verified_at',
        'verified_by', 'verification_notes',
    ];

    protected $casts = [
        'type' => DecedentDocumentType::class,
        'verification_status' => DocumentVerificationStatus::class,
        'issued_at' => 'date',
        'verified_at' => 'datetime',
    ];

    public function decedent(): BelongsTo
    {
        return $this->belongsTo(Decedent::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function supersedes(): BelongsTo
    {
        return $this->belongsTo(self::class, 'supersedes_id');
    }

    public function replacement(): HasOne
    {
        return $this->hasOne(self::class, 'supersedes_id');
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
            ->logOnly(['supersedes_id', 'type', 'document_number', 'issued_at', 'notes', 'verification_status', 'verified_at', 'verified_by'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('cemetery_decedent_document');
    }
}
