<?php

namespace App\Core\Cemetery\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Decedent extends Model
{

    use SoftDeletes;
    protected $table = "cemetery_decedents";

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [

        'id',

        'first_name',

        'last_name',

        'middle_name',

        'suffix',

        'memorial_name',

        'date_of_birth',

        'date_of_death',

        'date_of_registration',

        'decendent_type',

        'reference_document_type',

        'reference_document_number',

        'place_of_death',

        'gender',

        'cause_of_death',

        'death_certificate_no',

        'notes',

        'municipal_id',

        'address_id'

    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'date_of_death' => 'date',
        'date_of_registration' => 'date',
    ];

    protected function age()
    {
        return Attribute::make(
            get: function () {

                if ($this->date_of_birth && $this->date_of_death) {
                    return Carbon::parse($this->date_of_birth)->diffInYears(Carbon::parse($this->date_of_death));
                }
            }
        );
    }
}