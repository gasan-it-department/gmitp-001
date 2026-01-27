<?php

namespace App\Core\PublicInformation\Dto;

use App\External\Api\Request\PublicInformation\ProcurementRequest;

class StoreProcurementsDto
{
    /**
     * @param array<int, array{file: \Illuminate\Http\UploadedFile, type: string}> $attachments
     */
    public function __construct(
        public ?string $userId,
        public string $municipalId,
        public string $referenceNumber,
        public string $title,
        public string $category,
        public string $status,
        public float $approvedBudget,
        public ?float $contractAmount,
        public ?string $winningBidder,
        public ?string $preBidDate,
        public ?string $closingDate,
        public ?string $awardDate,
        public array $attachments = []
    ) {
    }

    public static function fromRequest(ProcurementRequest $request): self
    {
        $data = $request->validated();

        return new self(
            userId: $request->user()?->id,
            municipalId: app('municipal_id'),
            referenceNumber: strtoupper($data['reference_number']),
            title: strtoupper($data['title']),
            category: strtoupper($data['category']),
            status: strtoupper($data['status']),
            approvedBudget: (float) $data['approved_budget'],
            contractAmount: isset($data['contract_amount']) ? (float) $data['contract_amount'] : null,
            winningBidder: strtoupper($data['winning_bidder'] ?? null),
            preBidDate: $data['pre_bid_date'] ?? null,
            closingDate: $data['closing_date'] ?? null,
            awardDate: $data['award_date'] ?? null,

            // CHANGED: Map to the new 'attachments' key from the Request
            // This array will look like: [['file' => UploadedFile, 'type' => 'CONTRACT'], ...]
            attachments: $data['attachments'] ?? []
        );
    }
}