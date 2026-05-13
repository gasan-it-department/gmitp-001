<?php

namespace App\Core\ActionCenter\Models;

use App\Core\ActionCenter\Enums\Relationship;
use App\Core\Users\Models\User;
use Database\Factories\AssistanceRequestFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * The main transaction table for the Action Center. One row per citizen
 * assistance request. Records accumulate over time and are never hard-deleted.
 *
 * Important: the citizen does NOT propose an amount. amount_approved is set
 * only when the mayor / authorized approver grants the request, bounded by
 * the assistance type's min_amount / max_amount.
 */
class AssistanceRequest extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $table = 'ac_assistance_requests';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'municipal_id',
        'beneficiary_id',
        'household_id',
        'encoded_by_user_id',
        'reviewed_by_user_id',
        'approved_by_user_id',
        'assistance_type_id',

        // Authorized-representative fields (null = applicant is the beneficiary)
        'relationship_to_beneficiary',  // spouse | parent | child | sibling | null
        'on_behalf_first_name',
        'on_behalf_middle_name',
        'on_behalf_last_name',
        'on_behalf_suffix',
        'on_behalf_date_of_death',      // burial only

        'amount_approved',       // set only on approval
        'transaction_number',    // #REQ-YYYY-XXXX

        'status',                // pending | under_review | approved | released | rejected
        'description',           // citizen's reason for the request
        'remarks',               // admin notes during review

        'approved_at',
        'released_at',

        // Data Privacy Act (RA 10173) consent record.
        'privacy_consented_at',
        'privacy_notice_version',

        // Identity snapshot — frozen copy of ac_beneficiaries at request time.
        // Preserves historical accuracy if the citizen edits their profile later.
        'snapshot_first_name',
        'snapshot_last_name',
        'snapshot_middle_name',
        'snapshot_suffix',
        'snapshot_sex',
        'snapshot_birth_date',
        'snapshot_educational_attainment',
        'snapshot_religion',

        // Address snapshot — frozen copy of ac_households at request time.
        // Province omitted; municipal_id FK already captures that context.
        'snapshot_barangay',
        'snapshot_barangay_psgc_code',
        'snapshot_street',
    ];

    protected $casts = [
        'relationship_to_beneficiary' => Relationship::class,
        'on_behalf_date_of_death'     => 'date',
        'snapshot_birth_date'         => 'date',
        'amount_approved'             => 'decimal:2',
        'approved_at'                 => 'datetime',
        'released_at'                 => 'datetime',
        'privacy_consented_at'        => 'datetime',
    ];

    protected static function newFactory()
    {
        return AssistanceRequestFactory::new();
    }

    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(Beneficiary::class, 'beneficiary_id');
    }

    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class, 'household_id');
    }

    public function assistanceType(): BelongsTo
    {
        return $this->belongsTo(AssistanceType::class, 'assistance_type_id');
    }

    public function encodedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'encoded_by_user_id');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    /**
     * Files uploaded with this request. The schema is built to fit both
     * Cloudinary (public_id, resource_type) and local-disk storage paths.
     */
    public function files(): HasMany
    {
        return $this->hasMany(AssistanceRequestFile::class, 'assistance_request_id');
    }
}
