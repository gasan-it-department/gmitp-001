<?php

namespace App\Core\GoodsDistribution\Dto;

use App\Core\GoodsDistribution\Enums\CatalogKind;

final readonly class CatalogDto
{
    public function __construct(public string $municipalId, public string $actorId, public CatalogKind $kind, public array $data, public ?string $recordId = null) {}
}
