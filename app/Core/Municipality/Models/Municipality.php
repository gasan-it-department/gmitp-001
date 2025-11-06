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
        'municipal_code',
        'is_active',
        'zip_code',
    ];
}
