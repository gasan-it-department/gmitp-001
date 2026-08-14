<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Dto\CancelProcurementDto;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use Illuminate\Support\Facades\DB;

class CancelProcurementUseCase
{
    public function __construct(
        private ProcurementsRepository $procurementsRepository,
    ) {}

    public function execute(CancelProcurementDto $dto): void
    {
        DB::transaction(function () use ($dto) {
            $procurement = $this->procurementsRepository->lockByIdAndMunicipality(
                $dto->procurementId,
                $dto->municipalId,
            );

            if ($procurement->isPublished()) {
                throw new ProcurementDomainException('Unpublish this procurement for correction before changing its lifecycle status.');
            }

            if (blank($dto->reason)) {
                throw new ProcurementDomainException('A cancellation reason is required.');
            }

            $this->procurementsRepository->transitionStatus(
                $procurement,
                [ProcurementStatus::OPEN, ProcurementStatus::EVALUATING],
                ProcurementStatus::CANCELLED,
                [
                    'notes' => trim($dto->reason),
                    'winning_bidder_name' => null,
                    'contract_amount' => null,
                    'awarded_date' => null,
                    'failure_reason' => null,
                    'failed_date' => null,
                ],
            );
        }, attempts: 3);
    }
}
