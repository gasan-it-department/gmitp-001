<?php

namespace App\Core\Cemetery\Dto\Interments;

final readonly class ReverseMovedIntermentDto
{
    public function __construct(
        public string $municipalId,
        public string $intermentId,
        public string $reason,
    ) {}

    public static function fromRequest(string $intermentId, array $validated): self
    {
        return new self(
            municipalId: app('municipal_id'),
            intermentId: $intermentId,
            reason: trim($validated['reason']),
        );
    }
}
