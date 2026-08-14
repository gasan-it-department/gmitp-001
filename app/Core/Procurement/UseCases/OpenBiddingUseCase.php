<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Dto\OpenBiddingDto;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\ProcurementComplianceException;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use App\Core\Procurement\Services\ProcurementLegalRules;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OpenBiddingUseCase
{
    public function __construct(
        private ProcurementsRepository $procurementRepo,
        private ProcurementLegalRules $rules,
    ) {}

    public function execute(string $municipalId, string $procurementId, OpenBiddingDto $dto)
    {
        return DB::transaction(function () use ($municipalId, $procurementId, $dto) {
            $procurement = $this->procurementRepo->lockByIdAndMunicipality($procurementId, $municipalId);

            if ($procurement->isPublished()) {
                throw new ProcurementComplianceException('This procurement has already been published.');
            }

            $closingDate = Carbon::parse($dto->closingDate);
            if (! $closingDate->isFuture()) {
                throw new ProcurementComplianceException('The bidding closing date must be in the future.');
            }

            if ($dto->preBidDate && ! $this->rules->isTimeCompliant($dto->preBidDate, $closingDate)) {
                throw new ProcurementComplianceException(
                    'The closing date must be at least '.ProcurementLegalRules::MIN_DAYS_BETWEEN_PREBID_AND_CLOSING.' calendar days after the pre-bid date.'
                );
            }

            $procurement->fill([
                'abc_amount' => $dto->abcAmount,
                'pre_bid_date' => $dto->preBidDate,
                'closing_date' => $dto->closingDate,
                'reference_number' => trim($dto->referenceNumber),
            ]);

            $this->procurementRepo->transitionStatus(
                $procurement,
                ProcurementStatus::DRAFT,
                ProcurementStatus::OPEN,
                [
                    'abc_amount' => $dto->abcAmount,
                    'pre_bid_date' => $dto->preBidDate,
                    'closing_date' => $dto->closingDate,
                    'reference_number' => trim($dto->referenceNumber),
                ],
            );

            return $procurement;
        }, attempts: 3);
    }
}
