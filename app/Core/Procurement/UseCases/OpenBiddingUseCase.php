<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Dto\OpenBiddingDto;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\InvalidProcurementStateException;
use App\Core\Procurement\Exceptions\ProcurementComplianceException;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use App\Core\Procurement\Services\ProcurementLegalRules;

class OpenBiddingUseCase
{
    public function __construct(
        private ProcurementsRepository $procurementRepo,
        protected ProcurementLegalRules $rules
    ) {
    }

    public function execute(string $municipalId, string $procurementId, OpenBiddingDto $dto)
    {
        $procurement = $this->procurementRepo->findByIdAndMunicipality($procurementId, $municipalId);

        $this->ensureCanBeOpened($procurement);

        // 1. Check if the Pre-bid requirement is satisfied
        $hasDate = !is_null($dto->preBidDate);
        if (!$this->rules->satisfiesPreBidRequirement($dto->abcAmount, $hasDate)) {
            throw new ProcurementComplianceException(
                "Legal Requirement: ABC of ₱" . number_format(ProcurementLegalRules::MANDATORY_PRE_BID_THRESHOLD) . " or more requires a Pre-bid date."
            );
        }
        // 2. Check if the timeline is compliant (only if a pre-bid date exists)
        if ($dto->preBidDate && !$this->rules->isTimeCompliant($dto->preBidDate, $dto->closingDate)) {
            throw new ProcurementComplianceException(
                "Compliance Error: The closing date must be at least " . ProcurementLegalRules::MIN_DAYS_BETWEEN_PREBID_AND_CLOSING . " days after the pre-bid conference."
            );
        }

        // 4. Persistence
        $procurement->update([
            'abc_amount' => $dto->abcAmount,
            'pre_bid_date' => $dto->preBidDate,
            'closing_date' => $dto->closingDate,
            'reference_number' => $dto->referenceNumber,
            'status' => ProcurementStatus::OPEN,
            'published_at' => $procurement->published_at ?? now(),
        ]);

        return $procurement;
    }

    protected function ensureCanBeOpened($procurement): void
    {
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
    }
}