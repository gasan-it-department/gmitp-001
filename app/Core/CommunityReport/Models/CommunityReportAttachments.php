<?php

namespace App\Core\CommunityReport\Models;

use Illuminate\Database\Eloquent\Model;

class CommunityReportAttachments extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [

    ];

    public function citizenReport()
    {

        return $this->belongsTo(CommunityReport::class);

    }
}