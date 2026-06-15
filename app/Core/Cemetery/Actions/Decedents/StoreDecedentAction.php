<?php

namespace App\Core\Cemetery\Actions\Decedents;

use App\Core\Cemetery\Dto\Decedents\DecedentDto;
use App\Core\Cemetery\Enums\IdentityStatus;
use App\Core\Cemetery\Enums\RegistrationStatus;
use App\Core\Cemetery\Enums\VitalRecordType;
use App\Core\Cemetery\Models\Decedent;
use App\Core\Cemetery\Models\FetalDeathDetail;
use App\Core\Cemetery\Models\UnidentifiedDetail;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use App\Shared\Traits\HasAddress;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class StoreDecedentAction
{
    use HasAddress, StoresDecedentDocuments;

    public function __construct(private IdGeneratorInterface $idGenerator) {}

    public function execute(DecedentDto $dto): Decedent
    {
        return DB::transaction(function () use ($dto) {
            $addressId = $dto->psgcBarangayId
                ? $this->createAddressSnapshot($dto->psgcBarangayId, $dto->streetName, $this->idGenerator)
                : null;
            $submitted = $dto->submissionIntent === 'submit';

            $decedent = Decedent::create([
                'id' => $this->idGenerator->generate(),
                'municipal_id' => $dto->municipalId,
                'address_id' => $addressId,
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
                'version' => 1,
                // Legacy value remains populated during the compatibility window.
                'decedent_type' => $this->legacyType($dto),
            ]);

            $this->syncDetails($decedent, $dto);
            $this->storeDocuments($decedent, $dto->documents, $this->idGenerator);

            if ($dto->avatar instanceof UploadedFile) {
                $decedent->addMedia($dto->avatar)
                    ->usingFileName($dto->avatar->getClientOriginalName())
                    ->toMediaCollection('avatar', 'local');
            }

            return $decedent->fresh(['documents.media', 'unidentifiedDetail', 'fetalDeathDetail', 'media']);
        });
    }

    private function syncDetails(Decedent $decedent, DecedentDto $dto): void
    {
        if ($dto->identityStatus === IdentityStatus::UNIDENTIFIED->value) {
            $caseReference = $dto->unidentifiedDetails['case_reference']
                ?? 'UNID-'.now()->format('Y').'-'.substr($this->idGenerator->generate(), -8);

            UnidentifiedDetail::create([
                'id' => $this->idGenerator->generate(),
                'municipal_id' => $dto->municipalId,
                'decedent_id' => $decedent->id,
                ...$dto->unidentifiedDetails,
                'reference_code' => $caseReference,
                'case_reference' => $caseReference,
            ]);
        }

        if ($dto->vitalRecordType === VitalRecordType::FETAL_DEATH->value) {
            FetalDeathDetail::create([
                'id' => $this->idGenerator->generate(),
                'municipal_id' => $dto->municipalId,
                'decedent_id' => $decedent->id,
                ...$dto->fetalDetails,
            ]);
        }
    }

    private function legacyType(DecedentDto $dto): string
    {
        if ($dto->identityStatus === IdentityStatus::UNIDENTIFIED->value) {
            return 'unknown';
        }

        return $dto->vitalRecordType === VitalRecordType::FETAL_DEATH->value ? 'fetal' : 'standard';
    }
}
