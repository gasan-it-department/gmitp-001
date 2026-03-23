<?php

namespace App\Core\Procurement\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProcurementDocument extends Model
{
    protected $table = 'procurement_documents';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [

        'id',

        'procurement_id',

        'public_id',

        'file_name',

        'type',

        'resource_type',

        'file_size',

    ];

    public function getViewUrlAttribute()
    {
        $cloudName = config('cloudinary.cloud_name');

        $extension = $this->extension ? ".{$this->extension}" : '';

        return "https://res.cloudinary.com/{$cloudName}/{$this->resource_type}/upload/{$this->public_id}{$extension}";
    }

    public function getDownloadUrlAttribute()
    {
        $cloudName = config('cloudinary.cloud_name');

        $extension = $this->extension ? ".{$this->extension}" : '';

        return "https://res.cloudinary.com/{$cloudName}/{$this->resource_type}/upload/fl_attachment/{$this->public_id}{$extension}";
    }


    public function procurement(): BelongsTo
    {

        return $this->belongsTo(Procurement::class);

    }
}