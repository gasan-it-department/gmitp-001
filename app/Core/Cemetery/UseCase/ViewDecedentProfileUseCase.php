<?php

namespace App\Core\Cemetery\UseCase;

use App\Core\Cemetery\Repositories\DecedentsRepository;

class ViewDecedentProfileUseCase
{
    public function __construct(
        private DecedentsRepository $decedentRepo,
    ) {
    }

    public function execute(string $decedentId, string $municipalId)
    {
        return $this->decedentRepo->findDecedentById($municipalId, $decedentId);
    }
}