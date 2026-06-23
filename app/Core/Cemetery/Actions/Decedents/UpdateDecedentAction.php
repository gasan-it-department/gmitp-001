<?php

namespace App\Core\Cemetery\Actions\Decedents;

use App\Core\Cemetery\Dto\Decedents\DecedentDto;
use App\Core\Cemetery\Enums\IdentityStatus;
use App\Core\Cemetery\Enums\RegistrationStatus;
use App\Core\Cemetery\Enums\VitalRecordType;
use App\Core\Cemetery\Models\Decedent;
use App\Core\Cemetery\Models\UnidentifiedDetail;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateDecedentAction
{
    public function __construct(private IdGeneratorInterface $idGenerator) {}

    public function execute(DecedentDto $dto, string $decedentId): Decedent
    {

        return DB::transaction(function () use ($dto, $decedentId) {
            $decedent = Decedent::query()
                ->where('municipal_id', $dto->municipalId)
                ->lockForUpdate()
                ->findOrFail($decedentId);

            if (
                in_array($decedent->registration_status, [
                    RegistrationStatus::VERIFIED,
                    RegistrationStatus::ARCHIVED,
                ], true)
            ) {
                throw ValidationException::withMessages([
                    'record' => 'Verified or archived records cannot be edited directly.',
                ]);
            }

            if ($dto->version === null || $dto->version !== $decedent->version) {
                throw ValidationException::withMessages([
                    'version' => 'This record was changed by another user. Reload it before saving.',
                ]);
            }

            $submitted = $dto->submissionIntent === 'submit';
            $decedent->fill([
                'psgc_municipality_id' => $dto->psgcMunicipalityId,
                'psgc_barangay_code' => $dto->psgcBarangayCode,
                'street_name' => $dto->streetName,
                'vital_record_type' => $dto->vitalRecordType,
                'identity_status' => $dto->identityStatus,
                'registration_status' => $submitted
                    ? RegistrationStatus::PENDING_REVIEW->value
                    : RegistrationStatus::DRAFT->value,
                'has_legal_name' => $dto->hasLegalName,
                'first_name' => $dto->firstName,
                'last_name' => $dto->lastName,
                'middle_name' => $dto->middleName,
                'suffix' => $dto->suffix,
                'memorial_name' => $dto->memorialName,
                'gender' => $dto->gender,
                'date_of_birth' => $dto->dateOfBirth,
                'date_of_death' => $dto->dateOfDeath,
                'date_of_registration' => $dto->dateOfRegistration,
                'registry_number' => $dto->registryNumber,
                'death_certificate_no' => $dto->vitalRecordType === VitalRecordType::DEATH->value
                    ? $dto->registryNumber
                    : null,
                'cause_of_death' => $dto->causeOfDeath,
                'place_of_death' => $dto->placeOfDeath,
                'notes' => $dto->notes,
                'submitted_at' => $submitted ? now() : null,
                'submitted_by' => $submitted ? auth()->id() : null,
                'version' => $decedent->version + 1,
                'decedent_type' => $dto->identityStatus === IdentityStatus::UNIDENTIFIED->value
                    ? 'unknown'
                    : ($dto->vitalRecordType === VitalRecordType::FETAL_DEATH->value ? 'fetal' : 'standard'),
            ]);
            $decedent->save();

            $this->syncDetails($decedent, $dto);

            if ($dto->avatar instanceof UploadedFile) {
                $decedent->addMedia($dto->avatar)
                    ->usingFileName($dto->avatar->getClientOriginalName())
                    ->toMediaCollection('avatar', 'local');
            }

            return $decedent->fresh(['documents.media', 'unidentifiedDetail', 'media']);
        });
    }

    private function syncDetails(Decedent $decedent, DecedentDto $dto): void
    {
        if ($dto->identityStatus === IdentityStatus::UNIDENTIFIED->value) {
            $existing = $decedent->unidentifiedDetail;
            $caseReference = $existing?->case_reference
                ?? $dto->unidentifiedDetails['case_reference']
                ?? 'UNID-'.now()->format('Y').'-'.substr($this->idGenerator->generate(), -8);

            UnidentifiedDetail::updateOrCreate(
                ['decedent_id' => $decedent->id],
                [
                    'id' => $existing?->id ?? $this->idGenerator->generate(),
                    'municipal_id' => $dto->municipalId,
                    ...$dto->unidentifiedDetails,
                    'case_reference' => $caseReference,
                ]
            );
        }
    }
}
