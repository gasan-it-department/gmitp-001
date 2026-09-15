<?php

namespace App\Core\ActionCenter\Dto\Beneficiary;

final readonly class AssistanceCooldownEvaluation
{
    public function __construct(
        public bool $hasPermanentBlock,
        public CooldownAdvisory $advisory,
    ) {}
}
