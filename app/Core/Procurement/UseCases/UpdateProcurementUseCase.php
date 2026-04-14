<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Dto\UpdateProcurementDto;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use App\Core\Procurement\Services\ProcurementTimelineValidator;
use Carbon\Carbon;

class UpdateProcurementUseCase
{
    public function __construct(
        protected ProcurementsRepository $procurementsRepo,
        protected ProcurementTimelineValidator $procurementTimelineValidator
    ) {
    }

    public function execute(UpdateProcurementDto $dto, string $procurementId)
    {
        $procurement = $this->procurementsRepo->findByIdAndMunicipality($procurementId, $dto->municipalId);

        if (!$procurement->status instanceof ProcurementStatus) {
            throw new ProcurementDomainException("Action Denied: Invalid state or record.");
        }

        if (in_array($procurement->status->value, ['evaluating', 'awarded'])) {

            $newClosingDate = Carbon::parse($dto->closingDate);

            // ...the new closing date CANNOT be in the future!
            if ($newClosingDate->isFuture()) {
                throw new ProcurementDomainException(
                    "Action Denied: This project is already in the '{$procurement->status->label()}' phase. You cannot change the closing date to a future date because the bidding has physically concluded."
                );
            }

            // 🌟 Bonus Senior Check: If Awarded, closing date can't be AFTER the awarded date
            if ($procurement->status->value === 'awarded' && $procurement->awarded_date) {
                if ($newClosingDate->isAfter(Carbon::parse($procurement->awarded_date))) {
                    throw new ProcurementDomainException(
                        "Action Denied: The Closing Date cannot be set later than the Date Awarded."
                    );
                }
            }
        }

        $this->procurementTimelineValidator->validateSequence($dto->preBidDate, $dto->closingDate);

        $updateData = [
            'reference_number' => $dto->referenceNumber,
            'funding_source_id' => $dto->fundingSourceId,
            'department_id' => $dto->departmentId,
            'title' => $dto->title,
            'category' => $dto->category,
            'abc_amount' => $dto->abcAmount,
            'contract_amount' => $dto->contractAmount,
            'winning_bidder_name' => $dto->winningBidder,
            'pre_bid_date' => $dto->preBidDate,
            'closing_date' => $dto->closingDate,
            'awarded_date' => $dto->awardDate,
            'notes' => $dto->notes,
        ];

        $this->procurementsRepo->update($dto->municipalId, $procurementId, $updateData);

    }
}