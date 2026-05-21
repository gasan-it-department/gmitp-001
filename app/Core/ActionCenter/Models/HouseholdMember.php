<?php

namespace App\Core\ActionCenter\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * One row per person in a household. Populated by the admin during the
 * interview — citizens do not encode their own family on registration.
 *
 * A row may or may not be linked to ac_beneficiaries.id via beneficiary_id.
 * If NULL, the personal info is stored inline here. When that person later
 * registers, the admin links beneficiary_id and the inline fields become
 * the snapshot of who they were at first encoding.
 *
 * is_active = false means "moved out" — never hard-deleted.
 */
class HouseholdMember extends Model
{
    use HasUlids, LogsActivity, SoftDeletes;

    protected $table = 'ac_household_members';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'household_id',
        'beneficiary_id',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'birth_date',
        'educational_attainment',
        'sex',
        'relationship',
        'civil_status',
        'occupation',
        'monthly_income',
        'religion_id',
        'is_active',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'monthly_income' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Audit log for HouseholdMember edits. The citizen entered these rows
     * at registration; the admin can correct them during under_review.
     * Both paths leave an immutable trail keyed on this column set.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'first_name',
                'middle_name',
                'last_name',
                'suffix',
                'relationship',
                'birth_date',
                'sex',
                'civil_status',
                'occupation',
                'monthly_income',
                'educational_attainment',
                'religion_id',
                'is_active',
                'beneficiary_id',  // populated during identity reconciliation
            ])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('household_member');
    }

    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class, 'household_id');
    }

    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(Beneficiary::class, 'beneficiary_id');
    }
}
