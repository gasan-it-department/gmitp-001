<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Dto\UpdateAppointmentHistoryDto;
use App\Core\Government\Repositories\OfficialTermRepository;
use DomainException;

class UpdateHistoricalAppointmentUseCase
{

    public function __construct(
        private OfficialTermRepository $officialTermRepo,
    ) {
    }

    public function execute(string $officialTermId, string $municipalId, UpdateAppointmentHistoryDto $dto)
    {
        $record = $this->officialTermRepo->findScoped($officialTermId, $municipalId);

        if ($record->actual_end_date === null) {
            throw new DomainException("Use the standard Edit form for active officials.");
        }

        return $this->officialTermRepo->update($officialTermId, $municipalId, [
            'actual_start_date' => $dto->actualStartDate,
            'actual_end_date' => $dto->actualEndDate,
            'status' => $dto->status,
            'remarks' => $dto->remarks,
        ]);

    }

}