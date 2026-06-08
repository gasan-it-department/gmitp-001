<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\CreateBeneficiaryProfileDto;
use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\UseCase\Household\StoreHouseholdMemberAction;
use Illuminate\Support\Facades\DB;

/**
 * Creates the citizen's MSWD identity record in a single atomic transaction.
 *
 * Step 1 — Household: inserts one row into ac_households with the
 *           citizen's home address and the current municipality ID.
 *
 * Step 2 — Beneficiary: inserts one row into ac_beneficiaries linked to the
 *           household above and to the portal user account (user_id).
 *
 * After this action succeeds the citizen will pass the profile gate in
 * ApplyAssistanceRequestController and can submit assistance requests.
 *
 * ── Lock-order contract ────────────────────────────────────────────────
 * Locks in this order: users row → households insert → beneficiaries
 * insert. The users-row lock is held to serialize the double-submit
 * idempotency check (citizen double-clicks the Save button on the
 * profile setup form). If new locks are ever added here, append them
 * AFTER the existing chain — keep users first to match any other
 * action that touches users + ac_beneficiaries.
 *
 * `attempts: 3` retries on transient serialization failures around the
 * users-row lock without changing the idempotency semantics — the
 * "existing beneficiary found, return it" branch handles the rare case
 * where a concurrent transaction beat us to the insert.
 */
class CreateBeneficiaryProfileAction
{
    public function __construct(
        private readonly StoreHouseholdMemberAction $storeHouseholdMember,
        private readonly GenerateBeneficiaryNumberAction $generateBeneficiaryNumber,
    ) {
    }

    public function execute(CreateBeneficiaryProfileDto $dto): Beneficiary
    {
        return DB::transaction(function () use ($dto) {

            DB::table('users')
                ->where('id', $dto->userId)
                ->lockForUpdate()
                ->first();

            $existing = Beneficiary::where('user_id', $dto->userId)->first();
            if ($existing) {

                return $existing;
            }

            $household = Household::create([
                'municipal_id' => $dto->municipalId,
                'barangay' => $dto->barangay,
                'street' => $dto->street,
            ]);

            $beneficiary = Beneficiary::create([
                'household_id' => $household->id,
                'user_id' => $dto->userId,
                // Human-friendly lifelong ID (e.g. GAS-000123). Allocated under
                // a per-municipality row lock inside this same transaction.
                'beneficiary_number' => $this->generateBeneficiaryNumber->execute($dto->municipalId),
                'first_name' => $dto->firstName,
                'last_name' => $dto->lastName,
                'middle_name' => $dto->middleName,
                'suffix' => $dto->suffix,
                'sex' => $dto->sex,
                'birth_date' => $dto->birthDate,
                'religion_id' => $dto->religionId,
                'educational_attainment' => $dto->educationalAttainment,
                // Civil status / employment / income — paper-form parity.
                'civil_status' => $dto->civilStatus,
                'occupation' => $dto->occupation,
                'monthly_income' => $dto->monthlyIncome,
                'terms_consented_at' => $dto->termsConsentedAt,
                'terms_version' => $dto->termsVersion,
            ]);

            // ── Write the self-referencing "Head of Household" row ───────
            // The citizen IS a member of their own household. Mirroring
            // their identity here means every per-household operation
            // (cooldown fan-out, total income, member count) can query
            // a single table without special-casing the head.
            //
            // BeneficiaryObserver keeps this row in sync if the citizen
            // later edits their own profile.
            $this->storeHouseholdMember->execute(
                StoreHouseholdMemberDto::fromBeneficiary($beneficiary),
                beneficiaryId: $beneficiary->id,
            );

            // ── Fan out the OTHER household members the citizen listed ───
            // Each entry was already validated for shape by the FormRequest.
            // StoreHouseholdMemberAction enforces the per-household cap and
            // writes activity-log entries via spatie. All persists run
            // inside this same DB::transaction — partial writes impossible.
            // beneficiary_id stays NULL for these (unregistered family
            // members); identity reconciliation links them on future
            // registrations of those individuals.
            foreach ($dto->householdMembers as $memberData) {
                $this->storeHouseholdMember->execute(
                    StoreHouseholdMemberDto::fromArray($memberData, $household->id),
                );
            }

            return $beneficiary;
        }, attempts: 3);
    }
}
