<?php

namespace App\Core\ActionCenter\Dto\Beneficiary;

readonly class ReviewBeneficiaryIntakeDto
{
    /**
     * @param  array<int, string>  $verifiedMemberIds
     * @param  array<int, string>  $rejectedMemberIds
     */
    public function __construct(
        public string $beneficiaryId,
        public string $municipalId,
        public string $actingAdminId,
        public string $householdResolution,
        public ?string $targetMemberId,
        public ?string $householdResolutionReason,
        public array $verifiedMemberIds,
        public array $rejectedMemberIds,
    ) {}
}
