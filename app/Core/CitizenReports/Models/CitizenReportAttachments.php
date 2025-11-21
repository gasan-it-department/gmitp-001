<?php

namespace App\Core\CitizenReports\Models;

use Illuminate\Database\Eloquent\Model;

class CitizenReportAttachments extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [

    ];

    public function citizenReport()
    {

        return $this->belongsTo(CitizenReport::class);

    }
}