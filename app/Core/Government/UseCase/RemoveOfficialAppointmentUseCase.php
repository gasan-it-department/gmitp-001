<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Repositories\OfficialTermRepository;

class RemoveOfficialAppointmentUseCase
{

    public function __construct(
        private OfficialTermRepository $officialTermRepo,
    ) {
    }

    public function execute(string $id, string $municipalId)
    {

        return $this->officialTermRepo->delete($id, $municipalId);

    }

}