<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Dto\OpenBiddingDto;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\InvalidProcurementStateException;
use App\Core\Procurement\Repositories\ProcurementsRepository;

class OpenBiddingUseCase
{
    public function __construct(
        private ProcurementsRepository $procurementRepo,
    ) {
    }

    public function execute(string $municipalId, string $procurementId, OpenBiddingDto $dto)
    {
        $procurement = $this->procurementRepo->findByIdAndMunicipality($procurementId, $municipalId);

        if ($procurement->status === ProcurementStatus::OPEN) {
            throw InvalidProcurementStateException::alreadyOpen();
        }

        $invalidStatuses = [
            ProcurementStatus::EVALUATING,
            ProcurementStatus::AWARDED,
            ProcurementStatus::FAILED,
            ProcurementStatus::CANCELLED,
        ];

        if (in_array($procurement->status, $invalidStatuses)) {
            throw InvalidProcurementStateException::cannotOpen($procurement->status);
        }

        if (is_null($procurement->published_at)) {
            $procurement->published_at = now();
        }

        $procurement->update([
            'abc_amount' => $dto->abcAmount,
            'pre_bid_date' => $dto->preBidDate,
            'closing_date' => $dto->closingDate,
            'reference_number' => $dto->referenceNumber,
            'status' => ProcurementStatus::OPEN,
            'published_at' => now(),
        ]);

        return $procurement;
    }
}