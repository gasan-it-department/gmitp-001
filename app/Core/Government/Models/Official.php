<?php

namespace App\Core\Government\Models;

use App\Core\Government\Models\OfficialTerm;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Sluggable\SlugOptions;
use Spatie\Sluggable\HasSlug;

class Official extends Model implements HasMedia
{
    use InteractsWithMedia, LogsActivity, HasSlug;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'gov_officials';

    protected $fillable = [

        'id',

        'first_name',

        'last_name',

        'middle_name',

        'suffix',

        'gender',

        'biography',

        'municipal_id',

        'slug',

    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['first_name', 'last_name', 'middle_name', 'suffix', 'gender', 'biography'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('government_official');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('official_portrait')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    public function terms()
    {

        return $this->hasMany(OfficialTerm::class);

    }

    public function appointments()
    {
        return $this->hasMany(OfficialTerm::class, 'official_id');
    }

    public function activeAppointments()
    {
        return $this->appointments()->whereHas('term', function ($query) {
            $query->where('is_current', true);
        });
    }

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom(['first_name', 'last_name', 'suffix'])
            ->saveSlugsTo('slug')
            ->allowDuplicateSlugs(); // Spatie will automatically append -1, -2 if duplicates occur
    }

    public function fullNameWithTitle(): Attribute
    {

        return Attribute::make(
            get: function () {

                $title = 'HON.';

                $parts = array_filter([
                    $this->first_name,
                    $this->middle_name ? substr($this->middle_name, 0, 1) . '.' : null,
                    $this->last_name,
                    $this->suffix,
                ]);

                return $title . ' ' . implode(' ', $parts);
            }

        );

    }


}