<?php

namespace App\Core\Procurement\Dto;

use App\Core\Procurement\Enums\ProcurementCategory;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\External\Api\Request\Procurement\ProcurementRequest;

class StoreProcurementsDto
{
    /**
     * @param array<int, array{file: \Illuminate\Http\UploadedFile, type: string}> $attachments
     */
    public function __construct(
        public ?string $createdBy,
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

    public static function fromRequest(ProcurementRequest $request): self
    {
        $data = $request->validated();

        $cleanString = function ($value, $uppercase = true) {
            if (!is_string($value) || trim($value) === '') {
                return null; // Return clean nulls instead of empty strings
            }
            $cleaned = trim(preg_replace('/\s+/', ' ', $value));
            return $uppercase ? strtoupper($cleaned) : $cleaned;
        };

        $status = $data['is_historical']
            ? ProcurementStatus::from($data['status'])
            : ProcurementStatus::DRAFT;

        return new self(
            createdBy: $request->user()?->id,
            municipalId: app('municipal_id'),
            departmentId: $data['department_id'] ?? null,
            fundingSourceId: $data['funding_source_id'] ?? null,
            referenceNumber: $cleanString($data['reference_number'] ?? null),
            title: $cleanString($data['title'] ?? null),
            category: ProcurementCategory::from($data['category']) ?? ProcurementCategory::GOODS,
            status: $status,
            abcAmount: (float) ($data['abc_amount'] ?? 0),
            contractAmount: isset($data['contract_amount']) ? (float) $data['contract_amount'] : null,
            winningBidder: $cleanString($data['winning_bidder'] ?? null),
            notes: $cleanString($data['notes'] ?? null, false),
            preBidDate: $data['pre_bid_date'] ?? null,
            closingDate: $data['closing_date'] ?? null,
            awardDate: $data['awarded_date'] ?? null,
            documents: $data['documents'] ?? []
        );
    }
}