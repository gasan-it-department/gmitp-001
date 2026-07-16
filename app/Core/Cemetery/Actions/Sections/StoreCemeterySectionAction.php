<?php

namespace App\Core\Cemetery\Actions\Sections;

use App\Core\Cemetery\Dto\Sections\CemeterySectionDto;
use App\Core\Cemetery\Models\CemeterySite;
use App\Core\Cemetery\Models\Section;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;

class StoreCemeterySectionAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {}

    public function execute(CemeterySectionDto $dto): Section
    {
        CemeterySite::query()
            ->forMunicipality($dto->municipalId)
            ->where('status', 'active')
            ->findOrFail($dto->cemeterySiteId);

        return Section::create([
            'id' => $this->idGenerator->generate(),
            'municipal_id' => $dto->municipalId,
            'cemetery_site_id' => $dto->cemeterySiteId,
            'name' => $dto->name,
            'description' => $dto->description,
            'status' => 'active',
        ]);
    }
}
