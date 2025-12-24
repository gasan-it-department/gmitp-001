<?php

namespace App\Core\Auth\Models;

use Illuminate\Database\Eloquent\Model;

class VerificationCode extends Model
{

    protected $fillable = [

        'id',

        'receiver',

        'channel',

        'code',

        'expires_at',

    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'code' => 'string',
    ];


}