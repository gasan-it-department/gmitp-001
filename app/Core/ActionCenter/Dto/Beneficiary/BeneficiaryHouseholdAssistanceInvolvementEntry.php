<?php

namespace App\Core\ActionCenter\Dto\Beneficiary;

use App\Core\ActionCenter\Models\AssistanceRequest;
use DateTimeInterface;

final readonly class BeneficiaryHouseholdAssistanceInvolvementEntry
{
    public function __construct(
        public AssistanceRequest $request,
        public string $filerFullName,
        public string $subjectFullName,
        public ?string $householdCode,
        public string $cooldownState,
        public ?DateTimeInterface $cooldownStartsAt,
        public ?DateTimeInterface $cooldownExpiresAt,
    ) {}
}
