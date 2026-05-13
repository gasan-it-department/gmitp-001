<?php

namespace App\Core\ActionCenter\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * One row per uploaded document attached to an assistance request.
 *
 * Schema is dual-purpose:
 *  - For Cloudinary uploads:  public_id = Cloudinary public ID, resource_type = image|raw|video
 *  - For local-disk storage:  public_id = the storage path (e.g. "requests/01HZ.../valid_id.jpg")
 *
 * document_type matches ac_document_types.key (e.g. "valid_id", "hospital_bill") so the
 * admin panel can look up "did the citizen upload all required documents of type X?"
 * with a single indexed query.
 */
class AssistanceRequestFile extends Model
{
    use HasUlids, SoftDeletes;

    protected $table = 'ac_assistance_request_files';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'assistance_request_id',
        'document_type',
        'public_id',
        'mime_type',
        'resource_type',
        'original_name',
        'file_size',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function assistanceRequest(): BelongsTo
    {
        return $this->belongsTo(AssistanceRequest::class, 'assistance_request_id');
    }
}
