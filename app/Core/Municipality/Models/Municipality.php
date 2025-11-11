<?php

namespace App\Core\Municipality\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Route;

class Municipality extends Model
{
    // protected $table = 'municipalities';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'slug',
        'municipal_code',
        'is_active',
        'zip_code',
    ];

    // public function boot()
    // {
    //     parent::boot();
    //     Route::model('municipality', Municipality::class);
    // }
}
