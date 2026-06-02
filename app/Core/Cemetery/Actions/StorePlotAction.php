<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Dto\PlotDto;
use App\Core\Cemetery\Models\Plot;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;

/**
 * Creates a new plot (direct Eloquent — no repository). Tenancy comes from the
 * DTO, which sourced it from the bound municipal_id at the HTTP boundary.
 */
class StorePlotAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {
    }

    public function execute(PlotDto $dto): Plot
    {
        return Plot::create([
            'id' => $this->idGenerator->generate(),
            'municipal_id' => $dto->municipalId,
            'section_id' => $dto->sectionId,
            'plot_number' => $dto->plotNumber,
            'name' => $dto->name,
            'type' => $dto->type,
            'status' => $dto->status,
            'total_capacity' => $dto->totalCapacity,
        ]);
    }
}
