<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\CreateBeneficiaryProfileDto;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
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

            return Beneficiary::create([
                'household_id' => $household->id,
                'user_id' => $dto->userId,
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
        }, attempts: 3);
    }
}
