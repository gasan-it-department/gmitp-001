<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\ReleaseAssistanceRequestRequest;
use Carbon\CarbonImmutable;

/**
 * Pure-primitives DTO for the physical-handover workflow event.
 *
 * Released is the COA-immutable terminal state — once committed, the row
 * cannot be edited. Corrections require a NEW entry, never a mutation
 * (see the isTerminal() enum check that enforces this at the model layer).
 *
 * `cashierName` is retained as the historical field name. It is resolved in
 * the controller from the authenticated releasing user's
 * user's full_name accessor) so the action can stamp a human-readable
 * footer in remarks without a second query, symmetric to reject's pattern.
 */
readonly class ReleaseAssistanceRequestDto
{
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public string $cashierId,
        public string $cashierName,
        public string $releaseReferenceNumber,
        public CarbonImmutable $releasedAt,
        public ?string $releaseNotes,
        public ?string $disbursementId = null,
        public string $receiverType = 'claimant',
        public ?string $receiverName = null,
        public ?string $receiverRelationship = null,
        public ?string $receiverIdType = null,
        public ?string $receiverIdLastFour = null,
        public bool $identityConfirmed = true,
        public bool $acknowledgementSigned = true,
    ) {}

    public static function fromRequest(
        ReleaseAssistanceRequestRequest $request,
        string $assistanceRequestId,
        string $municipalId,
        string $cashierId,
        string $cashierName,
    ): self {
        $notes = $request->validated('release_notes');

        return new self(
            assistanceRequestId: $assistanceRequestId,
            municipalId: $municipalId,
            cashierId: $cashierId,
            cashierName: $cashierName,
            releaseReferenceNumber: trim((string) $request->validated('release_reference_number')),
            releasedAt: CarbonImmutable::parse(
                (string) $request->validated('release_date'),
                config('app.timezone'),
            )->startOfDay(),
            releaseNotes: is_string($notes) && trim($notes) !== '' ? trim($notes) : null,
            disbursementId: (string) $request->validated('disbursement_id'),
            receiverType: (string) $request->validated('receiver_type'),
            receiverName: self::nullableString($request->validated('receiver_name')),
            receiverRelationship: self::nullableString($request->validated('receiver_relationship')),
            receiverIdType: self::nullableString($request->validated('receiver_id_type')),
            receiverIdLastFour: self::nullableString($request->validated('receiver_id_last_four')),
            identityConfirmed: (bool) $request->validated('identity_confirmed'),
            acknowledgementSigned: (bool) $request->validated('acknowledgement_signed'),
        );
    }

    private static function nullableString(mixed $value): ?string
    {
        $normalized = trim((string) $value);

        return $normalized !== '' ? $normalized : null;
    }
}
