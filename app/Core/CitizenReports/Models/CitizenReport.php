<?php

namespace App\Core\CitizenReports\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CitizenReport extends Model
{
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [

        'id',

        'type',

        'sender_name',

        'description',

        'latitude',

        'longitude',

        'status',

        'contact',

        'location',

        'municipal_id',

        'resolved_at'

    ];

    public function attachments()
    {
        return $this->hasMany(CitizenReportAttachments::class);
    }
}