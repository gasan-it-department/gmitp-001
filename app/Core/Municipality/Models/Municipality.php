<?php

namespace App\Core\Municipality\Models;

use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Municipality extends Model implements HasMedia
{
    use InteractsWithMedia;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'psgc_municipal_id',
        'name',
        'slug',
        'municipal_code',
        'is_active',
        'zip_code',
    ];

    public function settings(): HasOne
    {
        return $this->hasOne(MunicipalitySettings::class, 'municipal_id');
    }

    public function hotlines(): HasMany
    {
        return $this->hasMany(MunicipalityHotline::class, 'municipal_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('logo')
            ->singleFile()
            ->acceptsMimeTypes([
                'image/jpeg',
                'image/png',
                'image/webp',
            ]);

        $this->addMediaCollection('banners')
            ->acceptsMimeTypes([
                'image/jpeg',
                'image/png',
                'image/webp',
            ]);
    }
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('optimized_banner')
            ->performOnCollections('banners')
            ->width(1200)
            ->format('webp')
            ->quality(80)
            ->nonQueued();

        $this->addMediaConversion('optimized_logo')
            ->performOnCollections('logo')
            ->width(400)
            ->format('webp')
            ->quality(80)
            ->nonQueued();
    }
}
