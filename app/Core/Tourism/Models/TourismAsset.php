<?php

namespace App\Core\Tourism\Models;

use App\Core\Municipality\Models\Municipality;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class TourismAsset extends Model implements HasMedia
{

    use InteractsWithMedia;
    protected $table = 'tourism_assets';

    protected $fillable = [
        'municipal_id',
        'category_id',
        'type',              // Discriminator: 'spot', 'event', 'establishment', 'heritage'
        'name',
        'slug',
        'short_description',
        'description',
        'is_published',
        'meta',              // The JSON pocket for type-specific details
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'meta' => 'array',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function municipality()
    {
        return $this->belongsTo(Municipality::class, 'municipal_id');
    }

}