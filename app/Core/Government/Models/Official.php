<?php

namespace App\Core\Government\Models;

use App\Core\Government\Models\OfficialTerm;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Official extends Model
{

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'gov_officials';

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

    public function appointments()
    {
        return $this->hasMany(OfficialTerm::class, 'official_id');
    }

    public function activeAppointments()
    {
        return $this->appointments()->whereHas('term', function ($query) {
            $query->where('is_current', true);
        });
    }

    public function fullNameWithTitle(): Attribute
    {

        return Attribute::make(
            get: function () {

                $title = 'HON.';

                $parts = array_filter([
                    $this->first_name,
                    $this->middle_name ? substr($this->middle_name, 0, 1) . '.' : null,
                    $this->last_name,
                    $this->suffix,
                ]);

                return $title . ' ' . implode(' ', $parts);
            }

        );

    }


}