<?php

namespace App\Core\ActionCenter\Beneficiaries\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Core\ActionCenter\Requests\Models\AssistanceRequest;

class Beneficiary extends Model
{
    use HasFactory;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'assistance_beneficiaries';

    protected $fillable = [

        'id',

        'municipality_id',

        'first_name',

        'middle_name',

        'last_name',

        'suffix',

        'birth_date',

        'contact_number',

        'email',

        'province',

        'municipality',

        'barangay',

    ];

    protected $casts = [

        'first_name' => 'encrypted',

        'last_name' => 'encrypted',

        'middle_name' => 'encrypted',

        'suffix' => 'encrypted',

        'contact_number' => 'encrypted',

        'email' => 'encrypted',

    ];

    public function assistanceRequests()
    {

        return $this->hasMany(AssistanceRequest::class, 'beneficiary_id');

    }
}