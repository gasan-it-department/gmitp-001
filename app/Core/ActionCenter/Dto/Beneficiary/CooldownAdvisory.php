<?php

namespace App\Core\ActionCenter\Dto\Beneficiary;

use Carbon\CarbonImmutable;

final readonly class CooldownAdvisory
{
    /** @param list<array<string, mixed>> $sources */
    public function __construct(
        public array $sources,
        public ?CarbonImmutable $effectiveExpiresAt,
        public string $contextFingerprint,
    ) {}

    public function isActive(): bool
    {
        return $this->sources !== [];
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'active' => $this->isActive(),
            'effective_expires_at' => $this->effectiveExpiresAt?->toIso8601String(),
            'context_fingerprint' => $this->contextFingerprint,
            'sources' => $this->sources,
        ];
    }
}
