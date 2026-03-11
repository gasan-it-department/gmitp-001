<?php

namespace App\Core\Government\Models;

use Illuminate\Database\Eloquent\Model;

class Position extends Model
{

    public $incrementing = false;

    protected $keyType = 'string';

    protected $table = 'gov_positions';

    protected $fillable = [

        'id',

        'title',

        'rank',

        'category',

    ];

    public function appointments()
    {

        return $this->hasMany(OfficialTerm::class, 'position_id');

    }

    public function activeAppointment()
    {
        return $this->hasOne(OfficialTerm::class, 'position_id')
            ->whereNull('actual_end_date'); // Logic: If end date is null, they are currently seated
    }

}