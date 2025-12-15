<?php

namespace App\Core\CommunityReport\Models;

use Illuminate\Database\Eloquent\Model;

class CommunityReportFiles extends Model
{

    // protected $table = 'community_report_files';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [

        'id',

        'report_id',

        'original_name',

        'public_id',

        'mime_type',

        'file_size',
    ];

    public function citizenReport()
    {

        return $this->belongsTo(CommunityReport::class, 'report_id');

    }
}