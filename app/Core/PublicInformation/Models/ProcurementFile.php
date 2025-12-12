<?php

namespace App\Core\PublicInformation\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProcurementFile extends Model
{
    protected $fillable = [

        'id',

        'procurement_id',

        'public_id',

        'file_name',

        'type',

        'resource_type',
    ];

    public function procurement(): BelongsTo
    {

        return $this->belongsTo(Procurement::class);

    }
}