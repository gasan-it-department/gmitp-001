<?php

namespace App\Core\Tourism\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Category extends Model
{
    use HasSlug;
    protected $table = 'tourism_categories';
    public $incrementing = false;
    protected $fillable = [
        'id',

        'municipal_id',

        'name',

        'slug',

        'type',

        'icon',

        'description'

    ];

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('name')
            ->saveSlugsTo('slug');
    }
    public function scopeForEstablishments(Builder $query)
    {
        return $query->where('type', 'establishment');
    }

    public function scopeForSpots(Builder $query)
    {
        return $query->where('type', 'spots');
    }

    public function scopeForEvents(Builder $query)
    {

    }

    public function scopeForHeritages(Builder $query)
    {
        return $query->where('type', 'heritage');
    }
}