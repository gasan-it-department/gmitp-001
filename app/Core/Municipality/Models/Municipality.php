<?php

namespace App\Core\Municipality\Models;

use App\Core\Users\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

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

    public function settings(): HasOne
    {

        return $this->hasOne(MunicipalitySettings::class, 'municipal_id');

    }

    public function banners()
    {

        return $this->hasMany(MunicipalityBanner::class, 'municipal_id');

    }

    public function users()
    {

        return $this->hasMany(User::class);

    }

}
