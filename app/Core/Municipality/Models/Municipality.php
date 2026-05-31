<?php

namespace App\Core\Municipality\Models;

use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

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
}
