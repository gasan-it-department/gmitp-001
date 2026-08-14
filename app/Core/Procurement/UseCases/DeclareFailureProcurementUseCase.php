<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Dto\FailureProcurementDto;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DeclareFailureProcurementUseCase
{
    public function __construct(
        private ProcurementsRepository $procurementsRepo,
    ) {}

    public function execute(FailureProcurementDto $dto): void
    {
        DB::transaction(function () use ($dto) {
            $procurement = $this->procurementsRepo->lockByIdAndMunicipality(
                $dto->procurementId,
                $dto->municipalId,
            );

            if ($procurement->isPublished()) {
                throw new ProcurementDomainException('Unpublish this procurement for correction before changing its lifecycle status.');
            }

            $failedDate = Carbon::parse($dto->failedDate)->startOfDay();
            if ($failedDate->isFuture()) {
                throw new ProcurementDomainException('The failed bidding date cannot be in the future.');
            }

            $this->procurementsRepo->transitionStatus(
                $procurement,
                [ProcurementStatus::OPEN, ProcurementStatus::EVALUATING],
                ProcurementStatus::FAILED,
                [
                    'failure_reason' => trim($dto->reason),
                    'failed_date' => $dto->failedDate,
                    'winning_bidder_name' => null,
                    'contract_amount' => null,
                    'awarded_date' => null,
                ],
            );
        }, attempts: 3);
    }
}
