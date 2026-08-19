<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\GenerateCertificateOfEligibilityRequest;
use Carbon\CarbonImmutable;

readonly class GenerateCertificateOfEligibilityDto
{
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public CarbonImmutable $intakeDate,
        public string $certifiedByName,
        public string $certifiedByPosition,
        public string $approvedByName,
        public string $approvedByPosition,
    ) {}

    public static function fromRequest(
        GenerateCertificateOfEligibilityRequest $request,
        string $assistanceRequestId,
        string $municipalId,
    ): self {
        return new self(
            assistanceRequestId: $assistanceRequestId,
            municipalId: $municipalId,
            intakeDate: CarbonImmutable::createFromFormat(
                '!Y-m-d',
                (string) $request->validated('intake_date'),
            ),
            certifiedByName: trim((string) $request->validated('certified_by_name')),
            certifiedByPosition: trim((string) $request->validated('certified_by_position')),
            approvedByName: trim((string) $request->validated('approved_by_name')),
            approvedByPosition: trim((string) $request->validated('approved_by_position')),
        );
    }
}
