<?php

namespace App\Core\ActionCenter\Models;

use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\Users\Models\User;
use Database\Factories\AssistanceRequestFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

/**
 * The main transaction table for the Action Center. One row per citizen
 * assistance request. Records accumulate over time and are never hard-deleted.
 *
 * Important: the citizen does NOT propose an amount. amount_approved is set
 * only when the mayor / authorized approver grants the request, bounded by
 * the assistance type's min_amount / max_amount.
 */
class AssistanceRequest extends Model implements HasMedia
{
    use HasFactory, HasUlids, InteractsWithMedia, LogsActivity, SoftDeletes;

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
        'rejected_by_user_id',
        'cancelled_by_user_id',
        'released_by_user_id',
        'release_reference_number',
        'assistance_type_id',

        // Authorized-representative fields (null = applicant is the beneficiary)
        'relationship_to_beneficiary',  // spouse | parent | child | sibling | null
        'on_behalf_first_name',
        'on_behalf_middle_name',
        'on_behalf_last_name',
        'on_behalf_suffix',
        'on_behalf_date_of_death',      // burial only
        'on_behalf_household_member_id',// FK to ac_household_members when filing for a family member

        'amount_approved',       // set only on approval
        'transaction_number',    // #REQ-YYYY-XXXX

        'status',                // pending | under_review | approved | released | rejected
        'description',           // citizen's reason for the request
        'remarks',               // admin notes during review

        'approved_at',
        'released_at',
        'rejected_at',
        'cancelled_at',

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
        'snapshot_civil_status',
        'snapshot_occupation',
        'snapshot_monthly_income',
        'snapshot_household_total_income',

        // Address snapshot — frozen copy of ac_households at request time.
        // Province omitted; municipal_id FK already captures that context.
        'snapshot_barangay',
        'snapshot_barangay_psgc_code',
        'snapshot_street',
    ];

    protected $casts = [
        'status' => AssistanceStatus::class,
        'relationship_to_beneficiary' => Relationship::class,
        'on_behalf_date_of_death' => 'date',
        'snapshot_birth_date' => 'date',
        'amount_approved' => 'decimal:2',
        'approved_at' => 'datetime',
        'released_at' => 'datetime',
        'rejected_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'privacy_consented_at' => 'datetime',
    ];

    /**
     * Log workflow mutations that matter for COA audit:
     * status transitions, approver assignment, approved amount, and admin remarks.
     * `logOnlyDirty` + `dontSubmitEmptyLogs` keeps the table clean on no-op saves.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'status',
                'amount_approved',
                'remarks',
                'reviewed_by_user_id',
                'approved_by_user_id',
                'rejected_by_user_id',
                'cancelled_by_user_id',
                'released_by_user_id',
                'release_reference_number',
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('assistance_request');
    }

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

    /**
     * The household member being assisted, when filing on behalf of a family
     * member. NULL means the filer is also the beneficiary.
     */
    public function onBehalfHouseholdMember(): BelongsTo
    {
        return $this->belongsTo(HouseholdMember::class, 'on_behalf_household_member_id');
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

    public function rejectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by_user_id');
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by_user_id');
    }

    public function releasedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'released_by_user_id');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('documents')
            ->useDisk('action_center')
            ->acceptsMimeTypes([
                'application/pdf',
                'image/jpeg',
                'image/png',
            ]);
    }
}
