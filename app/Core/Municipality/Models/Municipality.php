<?php

namespace App\Core\Municipality\Models;

use Illuminate\Database\Eloquent\Model;

class Municipality extends Model
{
    // protected $table = 'municipalities';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'code',
        'is_active',
        'region_code',
        'zip_code',
    ];
}
