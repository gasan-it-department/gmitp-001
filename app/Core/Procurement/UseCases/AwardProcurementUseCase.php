<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Dto\AwardProcurementDto;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use Carbon\Carbon;

class AwardProcurementUseCase
{
    public function __construct(
        private ProcurementsRepository $procurementRepo,
    ) {
    }

    public function execute(AwardProcurementDto $dto)
    {
        $procurement = $this->procurementRepo->findByIdAndMunicipality($dto->procurementId, $dto->municipalId);

        if (!$procurement) {
            throw new ProcurementDomainException("Procurement not found.");
        }

        if ($procurement->status !== ProcurementStatus::EVALUATING) {
            throw new ProcurementDomainException(
                "Action Denied: You can only award a project that is currently in the Evaluation phase."
            );
        }

        if (Carbon::parse($dto->awardedDate)->isBefore($procurement->closing_date)) {
            throw new ProcurementDomainException(
                "Invalid Date: The project cannot be awarded before the bidding closing date (" . Carbon::parse($procurement->closing_date)->format('M d, Y') . ")."
            );
        }

        $updateData = [
            'winning_bidder_name' => $dto->winnerName,
            'contract_amount' => $dto->contractAmount,
            'awarded_date' => $dto->awardedDate,
        ];

        $this->procurementRepo->update($dto->municipalId, $dto->procurementId, $updateData);

        $this->procurementRepo->transitionStatus(
            $dto->procurementId,
            ProcurementStatus::AWARDED
        );
    }
}