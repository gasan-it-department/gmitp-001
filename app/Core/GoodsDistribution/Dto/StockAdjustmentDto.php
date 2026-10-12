<?php

namespace App\Core\GoodsDistribution\Dto;

final readonly class StockAdjustmentDto
{
    public function __construct(public string $municipalId, public string $actorId, public string $operationKey, public string $reason, public string $reference, public string $quantity = '0', public string $direction = 'add') {}
}
