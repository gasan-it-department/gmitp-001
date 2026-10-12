<?php

namespace App\Core\GoodsDistribution\Dto;

final readonly class StockReceiptDto
{
    public function __construct(public string $municipalId, public string $actorId, public array $data, public ?string $receiptId = null, public ?string $scopedProgramId = null) {}
}
