<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\CreateHouseholdBeneficiaryDto;
use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\Exceptions\PotentialDuplicateBeneficiaryException;
use App\Core\ActionCenter\Exceptions\WalkInBeneficiaryIdentityDocumentStorageException;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\Services\HouseholdMemberIdentityMatcher;
use App\Core\ActionCenter\Services\LinkedHouseholdMemberProfileSynchronizer;
use App\Core\ActionCenter\UseCase\Household\StoreHouseholdMemberAction;
use App\Core\ActionCenter\UseCase\Shared\LockActionCenterMunicipalityAction;
use App\Core\Users\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Throwable;

final class CreateBeneficiaryInHouseholdAction
{
    public function __construct(
        private readonly GenerateBeneficiaryNumberAction $generateBeneficiaryNumber,
        private readonly FindPotentialDuplicateBeneficiariesAction $findPotentialDuplicates,
        private readonly StoreHouseholdMemberAction $storeMember,
        private readonly HouseholdMemberIdentityMatcher $identityMatcher,
        private readonly LinkedHouseholdMemberProfileSynchronizer $profileSynchronizer,
        private readonly LockActionCenterMunicipalityAction $lockMunicipality,
    ) {}

    public function execute(CreateHouseholdBeneficiaryDto $dto): Beneficiary
    {
        $beneficiary = DB::transaction(function () use ($dto): Beneficiary {
            $this->lockMunicipality->execute($dto->municipalId);
            $household = Household::query()
                ->whereKey($dto->householdId)
                ->where('municipal_id', $dto->municipalId)
                ->lockForUpdate()
                ->firstOrFail();

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

            $candidate = new Beneficiary([
                'first_name' => $dto->firstName,
                'middle_name' => $dto->middleName,
                'last_name' => $dto->lastName,
                'suffix' => $dto->suffix,
                'birth_date' => $dto->birthDate,
            ]);
            $matchingRows = HouseholdMember::query()
                ->where('household_id', $household->id)
                ->where('is_active', true)
                ->whereNull('beneficiary_id')
                ->lockForUpdate()
                ->get()
                ->filter(fn (HouseholdMember $member): bool => $this->identityMatcher->mismatches($member, $candidate) === [])
                ->values();

            if ($matchingRows->count() > 1) {
                throw new \DomainException(
                    'Multiple active unlinked household rows match this person. Correct the roster before registering a beneficiary profile.',
                );
            }

            $beneficiary = Beneficiary::create([
                'household_id' => $household->id,
                'municipal_id' => $dto->municipalId,
                'user_id' => null,
                'beneficiary_number' => $this->generateBeneficiaryNumber->execute($dto->municipalId),
                'first_name' => $dto->firstName,
                'middle_name' => $dto->middleName,
                'last_name' => $dto->lastName,
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
                'identity_verified_at' => null,
                'identity_verified_by_user_id' => null,
            ]);

            $member = $matchingRows->first();
            if ($member !== null) {
                $member->update([
                    'beneficiary_id' => $beneficiary->id,
                    'is_verified_dependent' => false,
                ]);
                $this->profileSynchronizer->sync($member, $beneficiary);
            } else {
                $member = $this->storeMember->execute(
                    new StoreHouseholdMemberDto(
                        householdId: $household->id,
                        firstName: $beneficiary->first_name,
                        lastName: $beneficiary->last_name,
                        middleName: $beneficiary->middle_name,
                        suffix: $beneficiary->suffix,
                        relationship: $dto->relationship,
                        birthDate: $beneficiary->birth_date?->toDateString(),
                        sex: $beneficiary->sex,
                        civilStatus: $beneficiary->civil_status?->value,
                        educationalAttainment: $beneficiary->educational_attainment?->value,
                        occupation: $beneficiary->occupation,
                        monthlyIncome: (float) $beneficiary->monthly_income,
                        religionId: $beneficiary->religion_id,
                    ),
                    beneficiaryId: $beneficiary->id,
                );
            }

            activity('beneficiary-walkin')
                ->performedOn($beneficiary)
                ->causedBy(User::find($dto->encodedByUserId))
                ->withProperties([
                    'municipal_id' => $dto->municipalId,
                    'beneficiary_id' => $beneficiary->id,
                    'household_id' => $household->id,
                    'household_member_id' => $member->id,
                    'reused_household_member' => $matchingRows->isNotEmpty(),
                    'forced_over_duplicate' => $dto->force,
                ])
                ->log('Encoded a beneficiary directly into an existing household');

            return $beneficiary;
        }, attempts: 3);

        $this->storeIdentityDocuments($beneficiary, $dto);

        if ($dto->verifyNow) {
            $beneficiary = $this->verifyAfterIdentityStored($beneficiary, $dto);
        }

        return $beneficiary->fresh(['household', 'media']);
    }

    private function storeIdentityDocuments(Beneficiary $beneficiary, CreateHouseholdBeneficiaryDto $dto): void
    {
        $this->storeIdentityDocument($beneficiary, $dto->identityIdFront, 'identity_id_front', 'front', $dto->verifyNow);
        $this->storeIdentityDocument($beneficiary, $dto->identityIdBack, 'identity_id_back', 'back', false);
    }

    private function storeIdentityDocument(
        Beneficiary $beneficiary,
        ?UploadedFile $file,
        string $collection,
        string $side,
        bool $requiredForVerification,
    ): void {
        if ($file instanceof UploadedFile) {
            try {
                $beneficiary
                    ->addMedia($file)
                    ->usingFileName($this->identityDocumentFileName($beneficiary, $side, $file))
                    ->toMediaCollection($collection);
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        if ($requiredForVerification && ! $beneficiary->fresh()->hasMedia($collection)) {
            throw WalkInBeneficiaryIdentityDocumentStorageException::frontUploadFailed($beneficiary->id);
        }
    }

    private function verifyAfterIdentityStored(
        Beneficiary $beneficiary,
        CreateHouseholdBeneficiaryDto $dto,
    ): Beneficiary {
        return DB::transaction(function () use ($beneficiary, $dto): Beneficiary {
            $this->lockMunicipality->execute($dto->municipalId);
            $locked = Beneficiary::query()->whereKey($beneficiary->id)->lockForUpdate()->firstOrFail();

            if (! $locked->hasMedia('identity_id_front')) {
                throw WalkInBeneficiaryIdentityDocumentStorageException::frontUploadFailed($locked->id);
            }

            $locked->update([
                'identity_verified_at' => now(),
                'identity_verified_by_user_id' => $dto->encodedByUserId,
            ]);
            HouseholdMember::query()
                ->where('beneficiary_id', $locked->id)
                ->where('household_id', $dto->householdId)
                ->where('is_active', true)
                ->lockForUpdate()
                ->update(['is_verified_dependent' => true]);

            return $locked->fresh();
        }, attempts: 3);
    }

    private function identityDocumentFileName(Beneficiary $beneficiary, string $side, UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'jpg');

        return 'identity-id-'.$side.'-'.$beneficiary->getKey().'.'.$extension;
    }
}
