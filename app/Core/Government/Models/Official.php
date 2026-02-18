<?php

namespace App\Core\Government\Models;

use App\Core\Government\Models\OfficialTerm;
use Illuminate\Database\Eloquent\Model;

class Official extends Model
{

    public $incrementing = false;

    protected $keyType = 'string';

    // protected $table = 'officials';

    protected $fillable = [

        'id',

        'first_name',

        'last_name',

        'middle_name',

        'suffix',

        'gender',

        'biography',

        'municipal_id',

        'profile_url',

        'profile_public_id',

    ];

    public function terms()
    {

        return $this->hasMany(OfficialTerm::class);

    }

    public function getFullNameAttribute()
    {

        return trim("{$this->first_name} {$this->middle_name} {$this->last_name} {$this->suffix}");

    }


}