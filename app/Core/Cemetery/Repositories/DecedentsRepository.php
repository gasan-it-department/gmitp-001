<?php

namespace App\Core\Cemetery\Repositories;

use App\Core\Cemetery\Dto\DecedentDto;
use App\Core\Cemetery\Models\Decedent;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Single source of truth for cemetery_decedents persistence.
 *
 * Every method MUST scope by municipal_id — there is no global scope. The
 * controller layer never touches the model directly.
 */
class DecedentsRepository
{
    public function save(DecedentDto $dto, string $decedentId, ?string $addressId): Decedent
    {
        return Decedent::create([
            'id' => $decedentId,
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
    }

    public function findByIdForMunicipality(string $municipalId, string $decedentId): Decedent
    {
        return Decedent::with(['currentInterment.plot.section'])
            ->where('municipal_id', $municipalId)
            ->findOrFail($decedentId);
    }

    public function paginateByMunicipality(string $municipalId, int $perPage = 10): LengthAwarePaginator
    {
        return Decedent::where('municipal_id', $municipalId)
            ->with(['currentInterment.plot'])
            ->orderByDesc('date_of_registration')
            ->paginate($perPage);
    }

    /**
     * Used by the interment-assignment screen: returns decedents that do not
     * yet have any non-pending interment row — i.e. they are eligible for
     * a fresh plot assignment.
     */
    public function paginateUninterredByMunicipality(string $municipalId, int $perPage = 25): LengthAwarePaginator
    {
        return Decedent::where('municipal_id', $municipalId)
            ->whereDoesntHave('interments', function ($query) {
                $query->whereIn('status', ['interred', 'transferred']);
            })
            ->orderByDesc('date_of_registration')
            ->paginate($perPage);
    }
}
