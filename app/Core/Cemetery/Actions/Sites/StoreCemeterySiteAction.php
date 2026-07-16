<?php

namespace App\Core\Cemetery\Actions\Sites;

use App\Core\Cemetery\Dto\Sites\CemeterySiteDto;
use App\Core\Cemetery\Enums\CemeterySiteStatus;
use App\Core\Cemetery\Models\CemeterySite;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;

class StoreCemeterySiteAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {}

    public function execute(CemeterySiteDto $dto): CemeterySite
    {
        return CemeterySite::create([
            'id' => $this->idGenerator->generate(),
            'municipal_id' => $dto->municipalId,
            'name' => $dto->name,
            'psgc_barangay_code' => $dto->psgcBarangayCode,
            'street_name' => $dto->streetName,
            'status' => CemeterySiteStatus::ACTIVE,
            'notes' => $dto->notes,
        ]);
    }
}
