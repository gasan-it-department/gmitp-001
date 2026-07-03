<?php

namespace App\Core\Cemetery\Actions\Sections;

use App\Core\Cemetery\Dto\Sections\UpdateCemeterySectionDto;
use App\Core\Cemetery\Models\CemeterySite;
use App\Core\Cemetery\Models\Section;

class UpdateCemeterySectionAction
{
    public function execute(UpdateCemeterySectionDto $dto): Section
    {
        CemeterySite::query()
            ->forMunicipality($dto->municipalId)
            ->where('status', 'active')
            ->findOrFail($dto->cemeterySiteId);

        $section = Section::query()
            ->forMunicipality($dto->municipalId)
            ->where('cemetery_site_id', $dto->cemeterySiteId)
            ->findOrFail($dto->sectionId);

        $section->update([
            'name' => $dto->name,
            'description' => $dto->description,
        ]);

        return $section;
    }
}
