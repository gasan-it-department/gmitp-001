<?php

namespace App\Core\Procurement\Dto;

use App\Core\Procurement\Enums\ProcurementCategory;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\External\Api\Request\Procurement\UpdateProcurementRequest;

class UpdateProcurementDto
{

    public function __construct(
        public string $municipalId,
        public ?string $departmentId,
        public ?string $fundingSourceId,
        public ?string $referenceNumber,
        public string $title,
        public ProcurementCategory $category,
        public ProcurementStatus $status,
        public float $abcAmount,
        public ?float $contractAmount,
        public ?string $winningBidder,
        public ?string $preBidDate,
        public ?string $closingDate,
        public ?string $awardDate,
        public ?string $notes,
        public array $documents = []
    ) {
    }

    public static function fromRequest(UpdateProcurementRequest $request)
    {
        $data = $request->validated();

        $cleanString = function ($value, $uppercase = true) {
            if (!is_string($value) || trim($value) === '') {
                return null; // Return clean nulls instead of empty strings
            }
            $cleaned = trim(preg_replace('/\s+/', ' ', $value));
            return $uppercase ? strtoupper($cleaned) : $cleaned;
        };

        return new self(
            municipalId: app('municipal_id'),
            departmentId: $data['department_id'] ?? null,
            fundingSourceId: $data['funding_source_id'] ?? null,
            referenceNumber: $cleanString($data['reference_number'] ?? null),
            title: $cleanString($data['title'] ?? null),
            category: ProcurementCategory::from($data['category']),
            status: ProcurementStatus::from($data['status']),
            abcAmount: (float) ($data['abc_amount'] ?? 0),
            contractAmount: isset($data['contract_amount']) ? (float) $data['contract_amount'] : null,
            winningBidder: $cleanString($data['winning_bidder'] ?? null),
            preBidDate: $data['pre_bid_date'] ?? null,
            closingDate: $data['closing_date'] ?? null,
            awardDate: $data['awarded_date'] ?? null,
            notes: $cleanString($data['notes'] ?? null, false),
            documents: $data['documents'] ?? []
        );
    }
}