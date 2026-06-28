<?php

namespace App\Core\Cemetery\Actions\Blocks;

use App\Core\Cemetery\Dto\Blocks\CemeteryBlockDto;
use App\Core\Cemetery\Models\Block;
use App\Core\Cemetery\Models\Section;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;

class StoreCemeteryBlockAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {}

    public function execute(CemeteryBlockDto $dto): Block
    {
        Section::query()
            ->where('municipal_id', $dto->municipalId)
            ->where('cemetery_site_id', $dto->cemeterySiteId)
            ->where('status', 'active')
            ->findOrFail($dto->sectionId);

        return Block::create([
            'id' => $this->idGenerator->generate(),
            'municipal_id' => $dto->municipalId,
            'section_id' => $dto->sectionId,
            'name' => $dto->name,
            'status' => 'active',
        ]);
    }
}
