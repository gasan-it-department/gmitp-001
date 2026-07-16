<?php

namespace App\Core\Cemetery\Actions\Blocks;

use App\Core\Cemetery\Dto\Blocks\UpdateCemeteryBlockDto;
use App\Core\Cemetery\Models\Block;
use App\Core\Cemetery\Models\Section;

class UpdateCemeteryBlockAction
{
    public function execute(UpdateCemeteryBlockDto $dto): Block
    {
        Section::query()
            ->where('municipal_id', $dto->municipalId)
            ->where('cemetery_site_id', $dto->cemeterySiteId)
            ->where('status', 'active')
            ->findOrFail($dto->sectionId);

        $block = Block::query()
            ->forMunicipality($dto->municipalId)
            ->where('section_id', $dto->sectionId)
            ->findOrFail($dto->blockId);

        $block->update([
            'name' => $dto->name,
        ]);

        return $block;
    }
}
