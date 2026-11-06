<?php

namespace App\Shared\Aga\Dto;

readonly class AgaNotificationResultDto
{
    public function __construct(
        public bool $ok,
        public string $schema,
        public string $audience,
        public int $devices,
        public int $sent,
        public int $failed,
        public array $invalidTokens,
        public array $errors,
    ) {}

    public function successful(): bool
    {
        return $this->ok && $this->failed === 0 && $this->invalidTokens === [] && $this->errors === [];
    }
}
