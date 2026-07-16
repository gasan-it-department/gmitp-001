<?php

namespace App\Core\Cemetery\Dto\Interments;

use Illuminate\Http\UploadedFile;

final readonly class CloseIntermentDto
{
    public function __construct(
        public string $municipalId,
        public string $intermentId,
        public string $endType,
        public string $endedDate,
        public string $reason,
        public ?string $notes,
        public ?string $permitReference,
        public ?string $transferDestination,
        public ?string $requestingPartyName,
        public ?string $requestingPartyContact,
        public ?string $requestingPartyAddress,
        public ?string $requestingPartyRelationship,
        public bool $requesterIsLeaseholder,
        public bool $leaseholderConsentConfirmed,
        public ?string $leaseholderConsentMethod,
        public ?string $leaseholderConsentReference,
        public ?string $serviceRequestNotes,
        public ?UploadedFile $authorizationEvidence,
    ) {}

    public static function fromRequest(string $intermentId, array $validated): self
    {
        return new self(
            municipalId: app('municipal_id'),
            intermentId: $intermentId,
            endType: $validated['end_type'],
            endedDate: $validated['ended_date'],
            reason: trim($validated['reason']),
            notes: self::trimNullable($validated['notes'] ?? null),
            permitReference: self::upperNullable($validated['permit_reference'] ?? null),
            transferDestination: self::trimNullable($validated['transfer_destination'] ?? null),
            requestingPartyName: self::upperNullable($validated['requesting_party_name'] ?? null),
            requestingPartyContact: self::trimNullable($validated['requesting_party_contact'] ?? null),
            requestingPartyAddress: self::upperNullable($validated['requesting_party_address'] ?? null),
            requestingPartyRelationship: self::upperNullable($validated['requesting_party_relationship'] ?? null),
            requesterIsLeaseholder: (bool) ($validated['requester_is_leaseholder'] ?? false),
            leaseholderConsentConfirmed: (bool) ($validated['leaseholder_consent_confirmed'] ?? false),
            leaseholderConsentMethod: self::trimNullable($validated['leaseholder_consent_method'] ?? null),
            leaseholderConsentReference: self::upperNullable($validated['leaseholder_consent_reference'] ?? null),
            serviceRequestNotes: self::trimNullable($validated['service_request_notes'] ?? null),
            authorizationEvidence: ($validated['authorization_evidence'] ?? null) instanceof UploadedFile
                ? $validated['authorization_evidence']
                : null,
        );
    }

    private static function trimNullable(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }

    private static function upperNullable(?string $value): ?string
    {
        $trimmed = self::trimNullable($value);

        return $trimmed === null ? null : mb_strtoupper($trimmed);
    }
}
