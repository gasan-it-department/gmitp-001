<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Dto\ConcludeOfficialDto;
use App\Core\Government\Repositories\OfficialTermRepository;

class ConcludeOfficialUseCase
{

    public function __construct(
        private OfficialTermRepository $officialTermRepo,
    ) {
    }

    public function execute(string $id, string $municipalId, ConcludeOfficialDto $dto)
    {
        $appointment = $this->officialTermRepo->findScoped($id, $municipalId);

        if ($appointment->actual_end_date !== null) {
            throw new \DomainException("This official's service has already been concluded.");
        }

        return $this->officialTermRepo->update($id, $municipalId, [
            'actual_end_date' => $dto->actualEndDate,
            'status' => $dto->status->value,
        ]);
    }

}