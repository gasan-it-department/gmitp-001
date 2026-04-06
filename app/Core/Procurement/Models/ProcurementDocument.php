<?php

namespace App\Core\Procurement\Models;

use App\Core\Procurement\Enums\ProcurementDocumentType;
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
        'uploaded_by',
        'file_path',
        'type',
        'mime_type',
        'file_name',
        'file_size',
    ];

    protected $casts = [
        'type' => ProcurementDocumentType::class,
        'file_size' => 'integer',
    ];

    public function procurement(): BelongsTo
    {
        return $this->belongsTo(Procurement::class);
    }

}