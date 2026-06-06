<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Dto\DecedentDto;
use App\Core\Cemetery\Models\Decedent;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use App\Shared\Traits\HasAddress;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

/**
 * Edits an existing decedent (direct Eloquent — no repository). Address snapshots
 * are immutable history: a changed barangay produces a NEW snapshot rather than
 * mutating the old row. `municipal_id` is never reassigned and the tenant scope on
 * the lookup 404s a cross-municipality id.
 */
class UpdateDecedentAction
{
    use HasAddress;

    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {
    }

    public function execute(DecedentDto $dto, string $decedentId): Decedent
    {
        return DB::transaction(function () use ($dto, $decedentId) {
            $addressId = null;

            if ($dto->psgcBarangayId !== null) {
                $addressId = $this->createAddressSnapshot(
                    $dto->psgcBarangayId,
                    $dto->streetName,
                    $this->idGenerator
                );
            }

            $decedent = Decedent::where('municipal_id', $dto->municipalId)
                ->findOrFail($decedentId);

            $decedent->fill([
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
            ]);

            // Only repoint the address when a fresh snapshot was created — a
            // no-address-change edit must not wipe the existing snapshot link.
            if ($addressId !== null) {
                $decedent->address_id = $addressId;
            }

            $decedent->save();

            $this->syncMedia($decedent, $dto);

            return $decedent->fresh(['media']);
        });
    }

    /**
     * Preserve-on-absent media semantics: a new avatar replaces the single photo;
     * a supplied identification set replaces the whole collection; when no files
     * are sent the existing media is left untouched (metadata-only edit).
     */
    private function syncMedia(Decedent $decedent, DecedentDto $dto): void
    {
        if ($dto->avatar instanceof UploadedFile) {
            $decedent->addMedia($dto->avatar)
                ->usingFileName($dto->avatar->getClientOriginalName())
                ->toMediaCollection('avatar');
        }

        if (! empty($dto->identificationFiles)) {
            $decedent->clearMediaCollection('identification');

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
}
