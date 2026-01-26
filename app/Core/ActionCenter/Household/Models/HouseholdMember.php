<?php

namespace App\Core\ActionCenter\Household\Models;

use Illuminate\Database\Eloquent\Model;

class HouseholdMember extends Model
{

    protected $fillable = [

        'id',

        'user_id',

        'first_name',

        'last_name',

        'middle_name',

        'suffix',

        'birth_date',

        'relationship',

        'province',

        'municipality',

        'barangay',

        'purok',

        'street_address',

    ];

}