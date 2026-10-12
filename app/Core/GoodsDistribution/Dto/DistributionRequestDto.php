<?php

namespace App\Core\GoodsDistribution\Dto;

final readonly class DistributionRequestDto
{
    public function __construct(public string $municipalId, public string $actorId, public array $data, public ?string $requestId = null) {}
}
