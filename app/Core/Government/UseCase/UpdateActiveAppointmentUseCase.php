<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Repositories\OfficialTermRepository;

class UpdateActiveAppointmentUseCase
{

    public function __construct(
        private OfficialTermRepository $officialTermRepository,
    ) {
    }

    public function execute(string $id, string $municipalId, $newStartDate)
    {

        $record = $this->officialTermRepository->findScoped($id, $municipalId);

        $this->officialTermRepository->update($id, $municipalId, [
            'actual_start_date' => $newStartDate,
        ]);


    }

}