<?php

namespace App\Core\Cemetery\UseCase;

use App\Core\Cemetery\Dto\PlotDto;
use App\Core\Cemetery\Models\Plot;
use App\Core\Cemetery\Repositories\PlotsRepository;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;

class CreatePlotUseCase
{
    public function __construct(
        private PlotsRepository $plotRepo,
        private IdGeneratorInterface $idGenerator,
    ) {
    }

    public function execute(PlotDto $dto): Plot
    {
        $plotId = $this->idGenerator->generate();

        return $this->plotRepo->create($dto, $plotId);
    }
}
