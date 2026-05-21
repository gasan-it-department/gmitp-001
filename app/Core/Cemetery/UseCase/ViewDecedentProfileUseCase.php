<?php

namespace App\Core\Cemetery\UseCase;

use App\Core\Cemetery\Models\Decedent;
use App\Core\Cemetery\Repositories\DecedentsRepository;

class ViewDecedentProfileUseCase
{
    public function __construct(
        private DecedentsRepository $decedentRepo,
    ) {
    }

    public function execute(string $decedentId, string $municipalId): Decedent
    {
        return $this->decedentRepo->findByIdForMunicipality($municipalId, $decedentId);
    }
}
