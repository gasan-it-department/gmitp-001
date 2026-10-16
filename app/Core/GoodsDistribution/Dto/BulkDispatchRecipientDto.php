<?php

namespace App\Core\GoodsDistribution\Dto;

final readonly class BulkDispatchRecipientDto
{
    public function __construct(public string $municipalId, public string $actorId, public string $dispatchId,
        public array $data, public ?string $recipientId = null) {}
}
