<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\UpdateBeneficiaryProfileDto;
use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\UseCase\Household\StoreHouseholdMemberAction;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

/**
 * Correct an existing beneficiary's identity / demographics / economic profile
 * as a deliberate, audited, ADMIN-ONLY action.
 *
 * Why admin-only: the hard identity (name / sex / birth date) is snapshotted
 * onto every assistance request for COA. Citizens must not silently rewrite it;
 * an MSWD officer corrects mistakes against the verified government ID.
 *
 * ── Head-row sync (the reason this is an action, not a bare update) ─────────
 * Every household has a self-referencing "Head" row in ac_household_members that
 * MIRRORS the beneficiary (created by StoreHouseholdMemberDto::fromBeneficiary).
 * If we updated only ac_beneficiaries the Head row would silently drift, so we
 * sync it inside the SAME transaction. We touch ONLY the Head row of THIS
 * beneficiary's own household — never other households that merely reference
 * this person via beneficiary_id (those are context-specific roster snapshots).
 *
 * ── Lock-order contract ─────────────────────────────────────────────────────
 * Inside one transaction: lock the beneficiary row (lockForUpdate) → update it
 * → sync its Head row. `attempts: 3` retries transient serialization failures.
 *
 * Auditing is automatic: both Beneficiary and HouseholdMember use the
 * LogsActivity trait with logOnlyDirty + dontLogEmptyChanges, so a real change
 * writes one activity row per model and a no-op writes none. The acting admin is
 * the causer via the global auth context.
 */
class UpdateBeneficiaryProfileAction
{
    public function __construct(
        private readonly StoreHouseholdMemberAction $storeHouseholdMember,
    ) {
    }

    public function execute(UpdateBeneficiaryProfileDto $dto): Beneficiary
    {
        return DB::transaction(function () use ($dto) {
            // Lock the target row and load the household for the tenant guard.
            $beneficiary = Beneficiary::query()
                ->with('household')
                ->whereKey($dto->beneficiaryId)
                ->lockForUpdate()
                ->firstOrFail();

            $this->ensureTenantMatch($beneficiary, $dto->municipalId);

            $beneficiary->update([
                'first_name'             => $dto->firstName,
                'last_name'              => $dto->lastName,
                'middle_name'            => $dto->middleName,
                'suffix'                 => $dto->suffix,
                'sex'                    => $dto->sex,
                'birth_date'             => $dto->birthDate,
                'religion_id'            => $dto->religionId,
                'educational_attainment' => $dto->educationalAttainment,
                'civil_status'           => $dto->civilStatus,
                'occupation'             => $dto->occupation,
                'monthly_income'         => $dto->monthlyIncome,
            ]);

            $this->syncHeadRow($beneficiary->fresh());

            return $beneficiary->fresh(['household', 'religion', 'user:id,email']);
        }, attempts: 3);
    }

    /**
     * Keep the beneficiary's own "Head of Household" row in lockstep with the
     * corrected identity. We match on household + relationship + self-link so we
     * never touch a different person's row. If the Head row is missing (legacy
     * data created before this invariant), recreate it from the beneficiary.
     */
    private function syncHeadRow(Beneficiary $beneficiary): void
    {
        $headRow = HouseholdMember::query()
            ->where('household_id', $beneficiary->household_id)
            ->where('relationship', Relationship::Head->value)
            ->where('beneficiary_id', $beneficiary->id)
            ->first();

        if (! $headRow) {
            // Defensive: no mirror row exists yet — create it. StoreHouseholdMember
            // enforces one-Head-per-household, so this is safe.
            $this->storeHouseholdMember->execute(
                StoreHouseholdMemberDto::fromBeneficiary($beneficiary),
                beneficiaryId: $beneficiary->id,
            );

            return;
        }

        // Mirror exactly the fields StoreHouseholdMemberDto::fromBeneficiary maps.
        $headRow->update([
            'first_name'             => $beneficiary->first_name,
            'last_name'              => $beneficiary->last_name,
            'middle_name'            => $beneficiary->middle_name,
            'suffix'                 => $beneficiary->suffix,
            'birth_date'             => $beneficiary->birth_date?->toDateString(),
            'sex'                    => $beneficiary->sex,
            'civil_status'           => $beneficiary->civil_status?->value,
            'educational_attainment' => $beneficiary->educational_attainment,
            'occupation'             => $beneficiary->occupation,
            'monthly_income'         => $beneficiary->monthly_income !== null
                ? (float) $beneficiary->monthly_income
                : 0,
            'religion_id'            => $beneficiary->religion_id,
        ]);
    }

    /**
     * municipal_id lives on the household, not the beneficiary. A cross-tenant
     * id is treated as unauthorized (the controller turns this into a redirect).
     */
    private function ensureTenantMatch(Beneficiary $beneficiary, string $municipalId): void
    {
        if ($beneficiary->household?->municipal_id !== $municipalId) {
            throw new AuthorizationException(
                'You may only edit beneficiaries from your own municipality.',
            );
        }
    }
}
