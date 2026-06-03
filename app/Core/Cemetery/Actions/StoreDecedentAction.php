<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Dto\DecedentDto;
use App\Core\Cemetery\Models\Decedent;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use App\Shared\Traits\HasAddress;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

/**
 * Registers a new decedent. Business logic + persistence live here (direct
 * Eloquent — no repository): create an immutable address snapshot when a
 * barangay is supplied, insert the record, then attach the identification media.
 * The whole thing is one transaction so a media failure rolls the row back.
 */
class StoreDecedentAction
{
    use HasAddress;

    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {
    }

    public function execute(DecedentDto $dto): Decedent
    {
        return DB::transaction(function () use ($dto) {
            $addressId = null;

            if ($dto->psgcBarangayId !== null) {
                $addressId = $this->createAddressSnapshot(
                    $dto->psgcBarangayId,
                    $dto->streetName,
                    $this->idGenerator
                );
            }

            $decedent = Decedent::create([
                'id' => $this->idGenerator->generate(),
                'first_name' => $dto->firstName,
                'last_name' => $dto->lastName,
                'middle_name' => $dto->middleName,
                'suffix' => $dto->suffix,
                'memorial_name' => $dto->memorialName,
                'date_of_birth' => $dto->dateOfBirth,
                'date_of_death' => $dto->dateOfDeath,
                'date_of_registration' => $dto->dateOfRegistration,
                'decedent_type' => $dto->decedentType,
                'reference_document_type' => $dto->referenceDocumentType,
                'reference_document_number' => $dto->referenceDocumentNumber,
                'place_of_death' => $dto->placeOfDeath,
                'gender' => $dto->gender,
                'cause_of_death' => $dto->causeOfDeath,
                'death_certificate_no' => $dto->deathCertNumber,
                'notes' => $dto->notes,
                'municipal_id' => $dto->municipalId,
                'address_id' => $addressId,
            ]);

            $this->attachMedia($decedent, $dto);

            return $decedent->fresh(['media']);
        });
    }

    /**
     * Attach the identification layer. `avatar` is a singleFile collection (it
     * auto-replaces); `identification` accepts multiple supporting documents.
     */
    private function attachMedia(Decedent $decedent, DecedentDto $dto): void
    {
        if ($dto->avatar instanceof UploadedFile) {
            $decedent->addMedia($dto->avatar)
                ->usingFileName($dto->avatar->getClientOriginalName())
                ->toMediaCollection('avatar');
        }

        foreach ($dto->identificationFiles as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $decedent->addMedia($file)
                ->usingFileName($file->getClientOriginalName())
                ->toMediaCollection('identification');
        }
    }
}
