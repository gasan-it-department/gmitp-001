<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\SaveAssistanceDisbursementRequest;
use Carbon\CarbonImmutable;

final readonly class SaveAssistanceDisbursementDto
{
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public string $actorId,
        public string $method,
        public string $instrumentReferenceNumber,
        public CarbonImmutable $instrumentDate,
        public string $claimLocationKey,
        public ?string $notes,
    ) {}

    public static function fromRequest(
        SaveAssistanceDisbursementRequest $request,
        string $assistanceRequestId,
        string $municipalId,
        string $actorId,
    ): self {
        $notes = trim((string) $request->validated('notes', ''));

        return new self(
            assistanceRequestId: $assistanceRequestId,
            municipalId: $municipalId,
            actorId: $actorId,
            method: (string) $request->validated('method'),
            instrumentReferenceNumber: trim((string) $request->validated('instrument_reference_number')),
            instrumentDate: CarbonImmutable::parse((string) $request->validated('instrument_date'))->startOfDay(),
            claimLocationKey: trim((string) $request->validated('claim_location_key')),
            notes: $notes !== '' ? $notes : null,
        );
    }
}
