<?php

namespace App\Core\ActionCenter\Beneficiaries\Models;

use Illuminate\Database\Eloquent\Model;

class BeneficiaryFlag extends Model
{

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'benefifiary_flags';

    protected $fillable = [

        'id',

        'assistance_beneficiary_id',

        'user_id',

        'user_id',

        'reason',

        'severity',

        'notes',

        'expires_at',

    ];

}