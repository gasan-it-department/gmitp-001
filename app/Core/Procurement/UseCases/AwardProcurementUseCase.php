<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Dto\AwardProcurementDto;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AwardProcurementUseCase
{
    public function __construct(
        private ProcurementsRepository $procurementRepo,
    ) {}

    public function execute(AwardProcurementDto $dto): void
    {
        DB::transaction(function () use ($dto) {
            $procurement = $this->procurementRepo->lockByIdAndMunicipality(
                $dto->procurementId,
                $dto->municipalId,
            );

            if ($procurement->isPublished()) {
                throw new ProcurementDomainException('Unpublish this procurement for correction before changing its lifecycle status.');
            }

            if ($dto->contractAmount <= 0 || $dto->contractAmount > (float) $procurement->abc_amount) {
                throw new ProcurementDomainException('The contract amount must be greater than zero and cannot exceed the ABC.');
            }

            if (blank($dto->winnerName)) {
                throw new ProcurementDomainException('The winning bidder is required.');
            }

            if (! $procurement->closing_date) {
                throw new ProcurementDomainException('The procurement has no official closing date.');
            }

            $awardedDate = Carbon::parse($dto->awardedDate);
            if (! $awardedDate->isAfter($procurement->closing_date)) {
                throw new ProcurementDomainException('The award date must be after the bidding closing date.');
            }

            if ($awardedDate->isFuture()) {
                throw new ProcurementDomainException('The award date cannot be in the future.');
            }

            $this->procurementRepo->transitionStatus(
                $procurement,
                ProcurementStatus::EVALUATING,
                ProcurementStatus::AWARDED,
                [
                    'winning_bidder_name' => trim($dto->winnerName),
                    'contract_amount' => $dto->contractAmount,
                    'awarded_date' => $dto->awardedDate,
                    'failure_reason' => null,
                    'failed_date' => null,
                ],
            );
        }, attempts: 3);
    }
}
