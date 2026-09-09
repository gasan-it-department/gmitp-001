<?php

namespace App\Core\ActionCenter\Models;

use App\Core\ActionCenter\Enums\AssistanceRequestDocumentCheckStatus;
use App\Core\ActionCenter\Enums\PhysicalCopyRequirement;
use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Frozen document requirement and its MSWD inspection result for one request.
 * Requirements are copied from the assistance type at filing/rollout time so
 * later settings edits cannot rewrite an existing case's checklist.
 */
class AssistanceRequestDocumentCheck extends Model
{
    use HasUlids;

    protected $table = 'ac_assistance_request_document_checks';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'assistance_request_id',
        'document_key',
        'label',
        'description',
        'is_required',
        'physical_copy_requirement',
        'sort_order',
        'is_applicable',
        'exemption_reason',
        'verification_status',
        'inspected_media_id',
        'inspected_media_version',
        'presented_copy_type',
        'remarks',
        'checked_by_user_id',
        'checked_at',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'is_applicable' => 'boolean',
        'sort_order' => 'integer',
        'verification_status' => AssistanceRequestDocumentCheckStatus::class,
        'physical_copy_requirement' => PhysicalCopyRequirement::class,
        'presented_copy_type' => PhysicalCopyRequirement::class,
        'checked_at' => 'datetime',
    ];

    public function assistanceRequest(): BelongsTo
    {
        return $this->belongsTo(AssistanceRequest::class, 'assistance_request_id');
    }

    public function checkedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_by_user_id');
    }

    public function inspectedMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'inspected_media_id');
    }
}
