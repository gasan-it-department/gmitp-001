<?php

namespace App\Core\GoodsDistribution\Dto;

final readonly class BulkDispatchDto
{
    public function __construct(public string $municipalId, public string $actorId, public array $data, public ?string $dispatchId = null) {}
}
