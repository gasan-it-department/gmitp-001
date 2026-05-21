<?php

namespace App\Core\Cemetery\UseCase;

use App\Core\Cemetery\Repositories\PlotsRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class GetPlotListUseCase
{
    public function __construct(
        private PlotsRepository $plotRepo,
    ) {
    }

    public function execute(string $municipalId, ?string $statusFilter = null, int $perPage = 15): LengthAwarePaginator
    {
        return $this->plotRepo->paginateByMunicipality($municipalId, $statusFilter, $perPage);
    }
}
