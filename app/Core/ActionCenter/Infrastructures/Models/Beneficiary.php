<?php

namespace App\Core\ActionCenter\Infrastructures\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Beneficiary extends Model
{
    use HasFactory;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $table = 'assistance_beneficiaries';

    protected $fillable = [
        'id',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'birth_date',
        'contact_number',
        'province',
        'municipality',
        'barangay',
    ];

    public function assistanceRequests()
    {
        return $this->hasMany(AssistanceRequest::class, 'beneficiary_id');
    }
}