<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\AuthorizeCooldownExceptionRequest;
use Carbon\CarbonImmutable;

final readonly class AuthorizeCooldownExceptionDto
{
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public string $actorId,
        public CarbonImmutable $releaseDate,
        public string $contextFingerprint,
        public string $reason,
    ) {}

    public static function fromRequest(
        AuthorizeCooldownExceptionRequest $request,
        string $assistanceRequestId,
        string $municipalId,
        string $actorId,
    ): self {
        return new self(
            assistanceRequestId: $assistanceRequestId,
            municipalId: $municipalId,
            actorId: $actorId,
            releaseDate: CarbonImmutable::parse((string) $request->validated('release_date'))->startOfDay(),
            contextFingerprint: (string) $request->validated('cooldown_context_fingerprint'),
            reason: trim((string) $request->validated('reason')),
        );
    }
}
