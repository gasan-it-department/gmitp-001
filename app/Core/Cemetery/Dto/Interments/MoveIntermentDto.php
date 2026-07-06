<?php

namespace App\Core\Cemetery\Dto\Interments;

use Carbon\Carbon;
use Illuminate\Http\UploadedFile;

final readonly class MoveIntermentDto
{
    public function __construct(
        public string $municipalId,
        public string $intermentId,
        public string $destinationCemeterySiteId,
        public string $destinationPlotId,
        public string $movementDate,
        public string $reason,
        public ?string $notes,
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
            destinationCemeterySiteId: $validated['destination_cemetery_site_id'],
            destinationPlotId: $validated['destination_plot_id'],
            movementDate: Carbon::parse($validated['movement_date'])->format('Y-m-d'),
            reason: trim($validated['reason']),
            notes: self::cleanText($validated['notes'] ?? null),
            requestingPartyName: self::cleanUpper($validated['requesting_party_name'] ?? null),
            requestingPartyContact: self::cleanText($validated['requesting_party_contact'] ?? null),
            requestingPartyAddress: self::cleanUpper($validated['requesting_party_address'] ?? null),
            requestingPartyRelationship: self::cleanUpper($validated['requesting_party_relationship'] ?? null),
            requesterIsLeaseholder: (bool) ($validated['requester_is_leaseholder'] ?? false),
            leaseholderConsentConfirmed: (bool) ($validated['leaseholder_consent_confirmed'] ?? false),
            leaseholderConsentMethod: self::cleanText($validated['leaseholder_consent_method'] ?? null),
            leaseholderConsentReference: self::cleanUpper($validated['leaseholder_consent_reference'] ?? null),
            serviceRequestNotes: self::cleanText($validated['service_request_notes'] ?? null),
            authorizationEvidence: ($validated['authorization_evidence'] ?? null) instanceof UploadedFile
                ? $validated['authorization_evidence']
                : null,
        );
    }

    private static function cleanText(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }

    private static function cleanUpper(?string $value): ?string
    {
        $cleaned = self::cleanText($value);

        return $cleaned === null ? null : mb_strtoupper($cleaned);
    }
}
