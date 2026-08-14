<?php

namespace App\Core\Procurement\Services;

use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\ProcurementComplianceException;
use App\Core\Procurement\Models\Procurement;
use Carbon\Carbon;

class ProcurementPublicationValidator
{
    public function __construct(
        private ProcurementLegalRules $legalRules,
        private ProcurementTimelineValidator $timelineValidator,
    ) {}

    public function validate(Procurement $procurement, ?ProcurementStatus $targetStatus = null): void
    {
        $status = $targetStatus ?? $procurement->status;

        if ($status === ProcurementStatus::DRAFT) {
            throw new ProcurementComplianceException('A draft procurement cannot be published.');
        }

        if (blank($procurement->reference_number)) {
            throw new ProcurementComplianceException('A PhilGEPS reference number is required before publication.');
        }

        if (blank($procurement->title)) {
            throw new ProcurementComplianceException('A project title is required before publication.');
        }

        if (blank($procurement->description)) {
            throw new ProcurementComplianceException('A plain-language project description is required before publication.');
        }

        if (! $procurement->department_id || ! $procurement->department()
            ->where('municipal_id', $procurement->municipal_id)
            ->where('is_active', true)
            ->exists()) {
            throw new ProcurementComplianceException('An active department from this municipality is required before publication.');
        }

        $fundingSource = $procurement->fundingSource()
            ->where('is_active', true)
            ->first();

        if (! $fundingSource) {
            throw new ProcurementComplianceException('An active funding source is required before publication.');
        }

        if ($fundingSource->code === 'OTHERS' && blank($procurement->custom_funding_source)) {
            throw new ProcurementComplianceException('The custom funding source must be specified before publication.');
        }

        if ($fundingSource->code !== 'OTHERS' && filled($procurement->custom_funding_source)) {
            throw new ProcurementComplianceException('A custom funding source is only allowed when Others is selected.');
        }

        if ((float) $procurement->abc_amount <= 0) {
            throw new ProcurementComplianceException('The Approved Budget for the Contract must be greater than zero.');
        }

        if (! $procurement->closing_date) {
            throw new ProcurementComplianceException('A bidding closing date is required before publication.');
        }

        if (! $this->legalRules->satisfiesPreBidRequirement(
            (float) $procurement->abc_amount,
            $procurement->pre_bid_date !== null,
        )) {
            throw new ProcurementComplianceException(
                'Projects with an ABC of PHP '.number_format(ProcurementLegalRules::MANDATORY_PRE_BID_THRESHOLD, 2).' or more require a pre-bid date.'
            );
        }

        $this->timelineValidator->validateSequence(
            $procurement->pre_bid_date,
            $procurement->closing_date,
            $procurement->awarded_date,
        );

        if ($status === ProcurementStatus::AWARDED) {
            $this->validateAward($procurement);
        }

        if ($status === ProcurementStatus::OPEN && ! $procurement->closing_date->isFuture()) {
            throw new ProcurementComplianceException('An open procurement must have a future closing date.');
        }

        if ($status === ProcurementStatus::EVALUATING && $procurement->closing_date->isFuture()) {
            throw new ProcurementComplianceException('An evaluating procurement cannot have a future closing date.');
        }

        if ($status === ProcurementStatus::FAILED) {
            $this->validateFailure($procurement);
        }

        if ($status === ProcurementStatus::CANCELLED && blank($procurement->notes)) {
            throw new ProcurementComplianceException('A cancellation reason is required before publication.');
        }
    }

    private function validateAward(Procurement $procurement): void
    {
        if (blank($procurement->winning_bidder_name)) {
            throw new ProcurementComplianceException('The winning bidder is required for an awarded procurement.');
        }

        $contractAmount = (float) $procurement->contract_amount;
        if ($contractAmount <= 0 || $contractAmount > (float) $procurement->abc_amount) {
            throw new ProcurementComplianceException('The contract amount must be greater than zero and cannot exceed the ABC.');
        }

        if (! $procurement->awarded_date) {
            throw new ProcurementComplianceException('The award date is required for an awarded procurement.');
        }

        if ($procurement->awarded_date->isFuture()) {
            throw new ProcurementComplianceException('The award date cannot be in the future.');
        }
    }

    private function validateFailure(Procurement $procurement): void
    {
        if (blank($procurement->failure_reason)) {
            throw new ProcurementComplianceException('The failed bidding reason is required.');
        }

        if (! $procurement->failed_date) {
            throw new ProcurementComplianceException('The failed bidding date is required.');
        }

        if (Carbon::parse($procurement->failed_date)->isFuture()) {
            throw new ProcurementComplianceException('The failed bidding date cannot be in the future.');
        }
    }
}
