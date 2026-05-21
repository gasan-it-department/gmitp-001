<?php

namespace App\Core\Cemetery\UseCase;

use App\Core\Cemetery\Repositories\DecedentsRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Returns a paginated list of decedents for a given municipality.
 * The municipal_id boundary is the caller's responsibility (controller pulls
 * from `app('municipal_id')`) and we forward it to the repository.
 */
class GetDecedentListUseCase
{
    public function __construct(
        private DecedentsRepository $decedentRepo,
    ) {
    }

    public function execute(string $municipalId, int $perPage = 10): LengthAwarePaginator
    {
        return $this->decedentRepo->paginateByMunicipality($municipalId, $perPage);
    }
}
