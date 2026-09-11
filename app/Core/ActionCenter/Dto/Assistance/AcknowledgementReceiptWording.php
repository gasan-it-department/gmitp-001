<?php

namespace App\Core\ActionCenter\Dto\Assistance;

readonly class AcknowledgementReceiptWording
{
    public function __construct(
        public ?string $assistanceLabel,
        public string $programName,
        public ?string $programQualifier,
        public ?string $programAcronym,
    ) {}

    public function resolvedAssistanceLabel(string $fallback): string
    {
        return $this->assistanceLabel ?: $fallback;
    }

    public function programLabel(): string
    {
        $qualifier = $this->programQualifier
            ? " ({$this->programQualifier})"
            : '';
        $acronym = $this->programAcronym
            ? " ({$this->programAcronym})"
            : '';

        return $this->programName.$qualifier.$acronym;
    }
}
