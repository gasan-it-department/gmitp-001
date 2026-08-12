<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\CreateWalkInBeneficiaryDto;
use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Exceptions\PotentialDuplicateBeneficiaryException;
use App\Core\ActionCenter\Exceptions\WalkInBeneficiaryIdentityDocumentStorageException;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\UseCase\Household\CreateHouseholdAction;
use App\Core\ActionCenter\UseCase\Household\StoreHouseholdMemberAction;
use App\Core\Users\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Creates an ADMIN-encoded walk-in beneficiary using a pending-first flow.
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
 * The household, beneficiary, and roster are committed atomically as pending.
 * Identity media is stored next, and an immediate verification request is
 * finalized in a second locked transaction only after the front ID exists.
 * This prevents an object-storage failure from leaving a verified identity
 * without its required evidence.
 *
 * Both database transactions retry transient serialization failures; the
 * soft-duplicate abort is a \DomainException and does not retry.
 */
class CreateWalkInBeneficiaryAction
{
    public function __construct(
        private readonly StoreHouseholdMemberAction $storeHouseholdMember,
        private readonly GenerateBeneficiaryNumberAction $generateBeneficiaryNumber,
        private readonly FindPotentialDuplicateBeneficiariesAction $findPotentialDuplicates,
        private readonly CreateHouseholdAction $createHousehold,
    ) {}

    public function execute(CreateWalkInBeneficiaryDto $dto): Beneficiary
    {
        $beneficiary = DB::transaction(function () use ($dto) {

            // ── Soft duplicate guard ────────────────────────────────────────
            // Stands in for the UNIQUE(user_id) constraint, which does nothing
            // for NULL-user walk-ins. Skipped once the admin reviews the
            // surfaced matches and confirms an override.
            if (! $dto->force) {
                $matches = $this->findPotentialDuplicates->execute(
                    firstName: $dto->firstName,
                    lastName: $dto->lastName,
                    birthDate: $dto->birthDate,
                    municipalId: $dto->municipalId,
                );

                if ($matches->isNotEmpty()) {
                    throw new PotentialDuplicateBeneficiaryException($matches);
                }
            }

            $household = $this->createHousehold->execute(
                $dto->municipalId,
                $dto->barangay,
                $dto->barangayCode,
                $dto->street,
            );

            $beneficiary = Beneficiary::create([
                'household_id' => $household->id,
                // Intrinsic tenant key — must mirror the household's municipality.
                'municipal_id' => $dto->municipalId,
                // Walk-in: no portal account is linked. The admin can link one
                // later (LinkBeneficiaryToUserAction) if the person registers.
                'user_id' => null,
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
                'civil_status' => $dto->civilStatus,
                'occupation' => $dto->occupation,
                'monthly_income' => $dto->monthlyIncome,
                'contact_phone' => $dto->contactPhone,
                'terms_consented_at' => $dto->termsConsentedAt,
                'terms_version' => $dto->termsVersion,
                // Verification happens only after required identity evidence is
                // successfully stored outside this database transaction.
                'identity_verified_at' => null,
                'identity_verified_by_user_id' => null,
            ]);

            // Self-referencing "Head of Household" row (same as online).
            $this->storeHouseholdMember->execute(
                StoreHouseholdMemberDto::fromBeneficiary($beneficiary),
                beneficiaryId: $beneficiary->id,
            );

            // Fan out the other household members the admin listed. Each entry
            // was shape-validated by the FormRequest; the action enforces the
            // per-household cap. beneficiary_id stays NULL for unregistered
            // members; when the admin recognised a member as already-registered
            // and the form carried that id, we LINK the row (don't duplicate) —
            // after re-verifying the id belongs to THIS municipality.
            foreach ($dto->householdMembers as $memberData) {
                $this->storeHouseholdMember->execute(
                    StoreHouseholdMemberDto::fromArray($memberData, $household->id),
                    beneficiaryId: $this->resolveTenantBeneficiaryId(
                        $memberData['beneficiary_id'] ?? null,
                        $dto->municipalId,
                    ),
                    isVerifiedDependent: false,
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
                    'municipal_id' => $dto->municipalId,
                    'beneficiary_id' => $beneficiary->id,
                    'household_id' => $household->id,
                    'forced_over_duplicate' => $dto->force,
                ])
                ->log('Encoded a walk-in beneficiary');

            return $beneficiary;
        }, attempts: 3);

        $this->storeIdentityDocuments($beneficiary, $dto);

        if ($dto->verifyNow) {
            $beneficiary = $this->verifyAfterIdentityStored($beneficiary, $dto->encodedByUserId);
        }

        return $beneficiary->fresh(['media']);
    }

    /**
     * Only allow linking a roster row to a beneficiary that actually lives in
     * THIS municipality (tenant key is on the household). Anything else — a
     * stray, forged, or cross-tenant id — is treated as "no link" rather than
     * aborting the whole registration.
     */
    private function resolveTenantBeneficiaryId(?string $beneficiaryId, string $municipalId): ?string
    {
        if (! $beneficiaryId) {
            return null;
        }

        $belongsToTenant = Beneficiary::query()
            ->whereKey($beneficiaryId)
            ->whereHas('household', fn ($q) => $q->where('municipal_id', $municipalId))
            ->exists();

        return $belongsToTenant ? $beneficiaryId : null;
    }

    private function storeIdentityDocuments(Beneficiary $beneficiary, CreateWalkInBeneficiaryDto $dto): void
    {
        if ($dto->identityIdFront instanceof UploadedFile) {
            try {
                $beneficiary
                    ->addMedia($dto->identityIdFront)
                    ->usingFileName($this->identityDocumentFileName($beneficiary, 'front', $dto->identityIdFront))
                    ->toMediaCollection('identity_id_front');
            } catch (Throwable $exception) {
                report($exception);

                if (! $beneficiary->fresh()->hasMedia('identity_id_front')) {
                    throw WalkInBeneficiaryIdentityDocumentStorageException::frontUploadFailed($beneficiary->id);
                }
            }
        }

        if ($dto->verifyNow && ! $beneficiary->fresh()->hasMedia('identity_id_front')) {
            throw WalkInBeneficiaryIdentityDocumentStorageException::frontUploadFailed($beneficiary->id);
        }

        if ($dto->identityIdBack instanceof UploadedFile) {
            try {
                $beneficiary
                    ->addMedia($dto->identityIdBack)
                    ->usingFileName($this->identityDocumentFileName($beneficiary, 'back', $dto->identityIdBack))
                    ->toMediaCollection('identity_id_back');
            } catch (Throwable $exception) {
                report($exception);
            }
        }
    }

    private function verifyAfterIdentityStored(Beneficiary $beneficiary, string $actingAdminId): Beneficiary
    {
        return DB::transaction(function () use ($beneficiary, $actingAdminId) {
            $lockedBeneficiary = Beneficiary::query()
                ->whereKey($beneficiary->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (! $lockedBeneficiary->hasMedia('identity_id_front')) {
                throw WalkInBeneficiaryIdentityDocumentStorageException::frontUploadFailed($lockedBeneficiary->id);
            }

            $lockedBeneficiary->update([
                'identity_verified_at' => now(),
                'identity_verified_by_user_id' => $actingAdminId,
            ]);

            HouseholdMember::query()
                ->where('household_id', $lockedBeneficiary->household_id)
                ->where('is_active', true)
                ->where('relationship', '!=', Relationship::Head->value)
                ->lockForUpdate()
                ->get()
                ->each(fn (HouseholdMember $member) => $member->update([
                    'is_verified_dependent' => true,
                ]));

            return $lockedBeneficiary->fresh();
        }, attempts: 3);
    }

    private function identityDocumentFileName(Beneficiary $beneficiary, string $side, UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'jpg');

        return 'identity-id-'.$side.'-'.$beneficiary->getKey().'.'.$extension;
    }
}
