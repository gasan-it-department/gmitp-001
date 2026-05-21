<?php

namespace App\Core\Cemetery\UseCase;

use App\Core\Cemetery\Repositories\PlotsRepository;
use Illuminate\Support\Collection;

/**
 * Returns plots in the AVAILABLE status, used to populate the assign-decedent
 * picker on the interment screen (REQ-3.1).
 */
class GetAvailablePlotsUseCase
{
    public function __construct(
        private PlotsRepository $plotRepo,
    ) {
    }

    public function execute(string $municipalId): Collection
    {
        return $this->plotRepo->listAvailableByMunicipality($municipalId);
    }
}
