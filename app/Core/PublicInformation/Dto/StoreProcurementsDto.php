<?php

namespace App\Core\PublicInformation\Dto;

use App\External\Api\Request\PublicInformation\ProcurementRequest;
use Illuminate\Http\UploadedFile;

class StoreProcurementsDto
{
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

        public array $files = [],

        public array $fileTypes = []
    ) {
    }

    public static function fromRequest(ProcurementRequest $request): self
    {
        $data = $request->validated();

        return new self(
            userId: $request->user()?->id,
            municipalId: app('municipal_id'),
            referenceNumber: $data['reference_number'],
            title: $data['title'],
            category: $data['category'],
            status: $data['status'],
            approvedBudget: (float) $data['approved_budget'],
            contractAmount: isset($data['contract_amount']) ? (float) $data['contract_amount'] : null,
            winningBidder: $data['winning_bidder'] ?? null,
            preBidDate: $data['pre_bid_date'] ?? null,
            closingDate: $data['closing_date'] ?? null,
            awardDate: $data['award_date'] ?? null,
            files: $data['files'] ?? [],
            fileTypes: $data['file_types'] ?? [],
        );
    }
}