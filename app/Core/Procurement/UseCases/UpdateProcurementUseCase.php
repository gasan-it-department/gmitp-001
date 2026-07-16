<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Dto\UpdateProcurementDto;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Models\Procurement;
use App\Core\Procurement\Services\ProcurementTimelineValidator;
use Carbon\Carbon;

class UpdateProcurementUseCase
{
    public function __construct(
        protected ProcurementTimelineValidator $procurementTimelineValidator
    ) {
    }

    public function execute(UpdateProcurementDto $dto, string $procurementId)
    {
        $procurement = Procurement::where('municipal_id', $dto->municipalId)
            ->findOrFail($procurementId);

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

        $procurement->update([
            'reference_number' => $dto->referenceNumber,
            'funding_source_id' => $dto->fundingSourceId,
            'custom_funding_source' => $dto->customFundingSource,
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
        ]);
    }
}