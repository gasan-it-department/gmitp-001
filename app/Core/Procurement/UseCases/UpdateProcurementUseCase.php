<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Dto\UpdateProcurementDto;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use App\Core\Procurement\Services\ProcurementTimelineValidator;
use Illuminate\Support\Facades\DB;

class UpdateProcurementUseCase
{
    public function __construct(
        protected ProcurementTimelineValidator $procurementTimelineValidator,
        protected ProcurementsRepository $procurementsRepository,
    ) {}

    public function execute(UpdateProcurementDto $dto, string $procurementId)
    {
        $this->procurementTimelineValidator->validateSequence($dto->preBidDate, $dto->closingDate);

        return DB::transaction(function () use ($dto, $procurementId) {
            $procurement = $this->procurementsRepository->lockByIdAndMunicipality(
                $procurementId,
                $dto->municipalId,
            );

            if ($procurement->isPublished()) {
                throw new ProcurementDomainException(
                    'Published procurement records are locked. Record a lifecycle outcome instead of rewriting public data.'
                );
            }

            $targetStatus = $procurement->status === ProcurementStatus::DRAFT && ! $dto->isHistorical
                ? ProcurementStatus::DRAFT
                : $dto->status;

            $this->validateOutcomeFields($dto, $targetStatus);

            $procurement->update([
                'reference_number' => $dto->referenceNumber,
                'funding_source_id' => $dto->fundingSourceId,
                'custom_funding_source' => $dto->customFundingSource,
                'department_id' => $dto->departmentId,
                'title' => $dto->title,
                'description' => $dto->description,
                'category' => $dto->category,
                'status' => $targetStatus,
                'abc_amount' => $dto->abcAmount,
                'contract_amount' => $targetStatus === ProcurementStatus::AWARDED ? $dto->contractAmount : null,
                'winning_bidder_name' => $targetStatus === ProcurementStatus::AWARDED ? $dto->winningBidder : null,
                'pre_bid_date' => $dto->preBidDate,
                'closing_date' => $dto->closingDate,
                'awarded_date' => $targetStatus === ProcurementStatus::AWARDED ? $dto->awardDate : null,
                'failure_reason' => $targetStatus === ProcurementStatus::FAILED ? $dto->failureReason : null,
                'failed_date' => $targetStatus === ProcurementStatus::FAILED ? $dto->failedDate : null,
                'notes' => $targetStatus === ProcurementStatus::CANCELLED ? $dto->notes : null,
            ]);

            return $procurement;
        }, attempts: 3);
    }

    private function validateOutcomeFields(UpdateProcurementDto $dto, ProcurementStatus $status): void
    {
        if ($status === ProcurementStatus::AWARDED) {
            if (blank($dto->winningBidder) || ! $dto->contractAmount || $dto->contractAmount <= 0) {
                throw new ProcurementDomainException('Awarded procurements require a winning bidder and positive contract amount.');
            }

            if ($dto->contractAmount > $dto->abcAmount) {
                throw new ProcurementDomainException('The contract amount cannot exceed the ABC.');
            }

            if (! $dto->awardDate) {
                throw new ProcurementDomainException('Awarded procurements require an award date.');
            }

            $this->procurementTimelineValidator->validateSequence(
                $dto->preBidDate,
                $dto->closingDate,
                $dto->awardDate,
            );
        }

        if ($status === ProcurementStatus::FAILED && (blank($dto->failureReason) || ! $dto->failedDate)) {
            throw new ProcurementDomainException('Failed procurements require a reason and failed bidding date.');
        }

        if ($status === ProcurementStatus::CANCELLED && blank($dto->notes)) {
            throw new ProcurementDomainException('Cancelled procurements require a cancellation reason.');
        }
    }
}
