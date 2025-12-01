<?php

namespace App\Core\CommunityReport\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CommunityReport extends Model
{
    // protected $table = 'community_reports';

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

        'resolved_at',

        'user_id'

    ];

    protected $casts = [

        'sender_name' => 'encrypted',

        'description' => 'encrypted',

        'contact' => 'encrypted'

    ];

    public function attachments()
    {

        return $this->hasMany(CommunityReportFiles::class, 'report_id');

    }
}