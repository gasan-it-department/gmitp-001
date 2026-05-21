<?php

namespace App\Core\Cemetery\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Section extends Model
{
    protected $table = 'cemetery_sections';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'municipal_id',
        'name',
        'boundary_polygon',
    ];

    public function plots(): HasMany
    {
        return $this->hasMany(Plot::class, 'section_id');
    }
}
