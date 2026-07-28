<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\CreateBeneficiaryProfileDto;
use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\Exceptions\BeneficiaryIdentityDocumentStorageException;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\BeneficiaryFlag;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Services\BeneficiarySmsNotifier;
use App\Core\ActionCenter\UseCase\Household\StoreHouseholdMemberAction;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Creates the citizen's MSWD identity record in a single atomic transaction.
 *
 * Step 1 — Household: inserts one row into ac_households with the
 *           citizen's home address and the current municipality ID.
 *
 * Step 2 — Beneficiary: inserts one row into ac_beneficiaries linked to the
 *           household above and to the portal user account (user_id).
 *
 * After this action succeeds the citizen has a provisional household and
 * remains pending until an MSWD administrator verifies the intake.
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
        private readonly FindPotentialDuplicateBeneficiariesAction $findPotentialDuplicates,
        private readonly \App\Core\ActionCenter\UseCase\Household\CreateHouseholdAction $createHousehold,
        private readonly BeneficiarySmsNotifier $smsNotifier,
    ) {
    }

    public function execute(CreateBeneficiaryProfileDto $dto): Beneficiary
    {
        $beneficiary = DB::transaction(function () use ($dto) {

            DB::table('users')
                ->where('id', $dto->userId)
                ->lockForUpdate()
                ->first();

            // Idempotency is PER MUNICIPALITY: a citizen already registered in
            // THIS LGU gets their existing record back, but the same login in a
            // DIFFERENT LGU falls through to create a fresh, separate record
            // there (one beneficiary per (user, municipality)).
            $existing = Beneficiary::where('user_id', $dto->userId)
                ->where('municipal_id', $dto->municipalId)
                ->first();
            if ($existing) {

                return $existing;
            }

            $household = $this->createHousehold->execute(
                $dto->municipalId,
                $dto->barangay,
                $dto->barangayCode,
                $dto->street,
            );

            $beneficiary = Beneficiary::create([
                'household_id' => $household->id,
                'user_id' => $dto->userId,
                // Intrinsic tenant key — must mirror the household's municipality.
                'municipal_id' => $dto->municipalId,
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
                'contact_phone' => $dto->contactPhone,
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

            // ── Soft duplicate detection (online self-service) ───────────
            // Never blocks — twins and common name+DOB collisions are real, so
            // hard-stopping a citizen's own registration would be hostile. We
            // instead raise a WARNING flag so an admin reviews it at interview
            // (where the government-ID check is the real gate). A confirmed
            // duplicate is later reconciled via MergeBeneficiaryAction.
            $possibleDuplicates = $this->findPotentialDuplicates->execute(
                firstName: $dto->firstName,
                lastName: $dto->lastName,
                birthDate: $dto->birthDate,
                municipalId: $dto->municipalId,
                excludeBeneficiaryId: $beneficiary->id,
            );

            if ($possibleDuplicates->isNotEmpty()) {
                BeneficiaryFlag::create([
                    'beneficiary_id' => $beneficiary->id,
                    'user_id' => null, // system-raised, not an admin action
                    'reason' => 'potential_duplicate',
                    'severity' => BeneficiaryFlag::SEVERITY_WARNING,
                    'notes' => 'Possible duplicate of: ' . $possibleDuplicates
                        ->map(fn(Beneficiary $b) => $b->beneficiary_number ?? $b->id)
                        ->implode(', ') . '. Verify against government ID before assisting.',
                ]);
            }

            return $beneficiary;
        }, attempts: 3);

        $wasRecentlyCreated = $beneficiary->wasRecentlyCreated;
        $frontWasMissing = !$beneficiary->hasMedia('identity_id_front');

        // A previous request may have committed the database records and then
        // failed while writing the required ID to object storage. In that case,
        // a retry must repair the missing media instead of returning the
        // existing beneficiary unchanged. Existing media is never replaced by
        // this recovery path; deliberate replacements remain admin-only.
        if ($wasRecentlyCreated || $frontWasMissing) {
            $this->storeMissingRequiredFront($beneficiary, $dto);
            $this->storeMissingOptionalBack($beneficiary, $dto);
            $this->smsNotifier->profileReceived($beneficiary);
        }

        return $beneficiary->fresh(['media']);
    }

    private function storeMissingRequiredFront(
        Beneficiary $beneficiary,
        CreateBeneficiaryProfileDto $dto,
    ): void {
        if ($beneficiary->hasMedia('identity_id_front')) {
            return;
        }

        if (!$dto->identityIdFront instanceof UploadedFile) {
            throw BeneficiaryIdentityDocumentStorageException::requiredFrontMissing();
        }

        try {
            $beneficiary
                ->addMedia($dto->identityIdFront)
                ->usingFileName($this->identityDocumentFileName($beneficiary, 'front', $dto->identityIdFront))
                ->toMediaCollection('identity_id_front');
        } catch (Throwable $exception) {
            report($exception);

            // Some storage adapters can throw after the media row was already
            // persisted. Only ask the citizen to retry when the required file
            // is genuinely still absent.
            if (!$beneficiary->fresh()->hasMedia('identity_id_front')) {
                throw BeneficiaryIdentityDocumentStorageException::frontUploadFailed();
            }
        }
    }

    private function storeMissingOptionalBack(
        Beneficiary $beneficiary,
        CreateBeneficiaryProfileDto $dto,
    ): void {
        if (
            $beneficiary->hasMedia('identity_id_back')
            || !$dto->identityIdBack instanceof UploadedFile
        ) {
            return;
        }

        try {
            $beneficiary
                ->addMedia($dto->identityIdBack)
                ->usingFileName($this->identityDocumentFileName($beneficiary, 'back', $dto->identityIdBack))
                ->toMediaCollection('identity_id_back');
        } catch (Throwable $exception) {
            // The back image is optional in v1. Keep the valid profile/front-ID
            // submission usable while still surfacing the storage failure to
            // operations for investigation.
            report($exception);
        }
    }

    private function identityDocumentFileName(Beneficiary $beneficiary, string $side, UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'jpg');

        return 'identity-id-' . $side . '-' . $beneficiary->getKey() . '.' . $extension;
    }
}
