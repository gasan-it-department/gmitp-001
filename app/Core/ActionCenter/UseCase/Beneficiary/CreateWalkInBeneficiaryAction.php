<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\CreateWalkInBeneficiaryDto;
use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\Exceptions\PotentialDuplicateBeneficiaryException;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\UseCase\Household\StoreHouseholdMemberAction;
use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Creates an ADMIN-encoded walk-in beneficiary in one atomic transaction.
 *
 * This is the in-office sibling of CreateBeneficiaryProfileAction. It is a
 * SEPARATE action — not a branch of the online one — because the two workflows
 * differ in ways that would otherwise pile conditionals into one method:
 *
 *   • No portal account. user_id is NULL; there is no users-row lock and no
 *     user_id idempotency check (the online action's `where('user_id', …)`
 *     dedup is meaningless — even harmful — for a NULL user).
 *   • Duplicate control is a SOFT name + birth-date match (the UNIQUE(user_id)
 *     constraint can't protect walk-ins). On a hit, unless the admin forced an
 *     override, we abort with the matches so the UI can ask "different person?".
 *   • The actor is the admin, recorded via the activity log's causer.
 *
 * Everything downstream of the beneficiary row (head-of-household self row +
 * member fan-out) reuses StoreHouseholdMemberAction exactly like the online
 * flow, so that logic stays shared, not duplicated.
 *
 * `attempts: 3` retries transient serialization failures; the soft-duplicate
 * abort is a \DomainException and does not retry.
 */
class CreateWalkInBeneficiaryAction
{
    public function __construct(
        private readonly StoreHouseholdMemberAction $storeHouseholdMember,
    ) {
    }

    public function execute(CreateWalkInBeneficiaryDto $dto): Beneficiary
    {
        return DB::transaction(function () use ($dto) {

            // ── Soft duplicate guard ────────────────────────────────────────
            // Stands in for the UNIQUE(user_id) constraint, which does nothing
            // for NULL-user walk-ins. Skipped once the admin reviews the
            // surfaced matches and confirms an override.
            if (! $dto->force) {
                $matches = $this->findPossibleDuplicates($dto);

                if ($matches->isNotEmpty()) {
                    throw new PotentialDuplicateBeneficiaryException($matches);
                }
            }

            $household = Household::create([
                'municipal_id' => $dto->municipalId,
                'barangay'     => $dto->barangay,
                'street'       => $dto->street,
            ]);

            $beneficiary = Beneficiary::create([
                'household_id'           => $household->id,
                // Walk-in: no portal account is linked. The admin can link one
                // later (LinkBeneficiaryToUserAction) if the person registers.
                'user_id'                => null,
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
                'terms_consented_at'     => $dto->termsConsentedAt,
                'terms_version'          => $dto->termsVersion,
            ]);

            // Self-referencing "Head of Household" row (same as online).
            $this->storeHouseholdMember->execute(
                StoreHouseholdMemberDto::fromBeneficiary($beneficiary),
                beneficiaryId: $beneficiary->id,
            );

            // Fan out the other household members the admin listed. Each entry
            // was shape-validated by the FormRequest; the action enforces the
            // per-household cap. beneficiary_id stays NULL for unregistered
            // members (identity reconciliation links them on future registration).
            foreach ($dto->householdMembers as $memberData) {
                $this->storeHouseholdMember->execute(
                    StoreHouseholdMemberDto::fromArray($memberData, $household->id),
                );
            }

            // ── Audit: who encoded this walk-in ─────────────────────────────
            // user_id is excluded from Beneficiary's LogsActivity set, so this
            // explicit entry is the record of an admin-created identity (DPA +
            // COA trail). `forced_over_duplicate` flags overrides for review.
            activity('beneficiary-walkin')
                ->performedOn($beneficiary)
                ->causedBy(User::find($dto->encodedByUserId))
                ->withProperties([
                    'municipal_id'          => $dto->municipalId,
                    'beneficiary_id'        => $beneficiary->id,
                    'household_id'          => $household->id,
                    'forced_over_duplicate' => $dto->force,
                ])
                ->log('Encoded a walk-in beneficiary');

            return $beneficiary;
        }, attempts: 3);
    }

    /**
     * Beneficiaries in THIS municipality sharing the same first name, last name,
     * and birth date (case-insensitive). Tenant scope lives on the household.
     *
     * @return Collection<int, Beneficiary>
     */
    private function findPossibleDuplicates(CreateWalkInBeneficiaryDto $dto): Collection
    {
        return Beneficiary::query()
            ->whereHas('household', fn ($q) => $q->where('municipal_id', $dto->municipalId))
            ->whereRaw('LOWER(first_name) = ?', [mb_strtolower($dto->firstName)])
            ->whereRaw('LOWER(last_name) = ?', [mb_strtolower($dto->lastName)])
            ->whereDate('birth_date', $dto->birthDate)
            ->with(['household', 'user:id,email'])
            ->get();
    }
}
