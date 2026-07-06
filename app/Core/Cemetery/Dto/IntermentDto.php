<?php

namespace App\Core\Cemetery\Dto;

use Carbon\Carbon;
use Illuminate\Http\UploadedFile;

/**
 * Immutable transport for recording one interment event. Plot assignability is
 * enforced by RecordIntermentAction using the plot occupancy mode and capacity.
 */
final readonly class IntermentDto
{
    public function __construct(
        public string $municipalId,
        public string $decedentId,
        public string $plotId,
        public string $intermentDate,
        public string $type,
        public ?string $notes,
        public ?string $pendingDocumentReason,
        public ?string $pendingDocumentReference,
        public bool $pendingDocumentConfirmed,
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

    public static function fromRequest(array $validated): self
    {
        $intermentDate = self::normalizeDate($validated['interment_date']);

        return new self(
            municipalId: app('municipal_id'),
            decedentId: $validated['decedent_id'],
            plotId: $validated['plot_id'],
            intermentDate: $intermentDate,
            type: $validated['type'] ?? 'initial',
            notes: self::cleanText($validated['notes'] ?? null),
            pendingDocumentReason: self::cleanText($validated['pending_document_reason'] ?? null),
            pendingDocumentReference: self::cleanText($validated['pending_document_reference'] ?? null),
            pendingDocumentConfirmed: (bool) ($validated['pending_document_confirmed'] ?? false),
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

    private static function normalizeDate(string $value): string
    {
        return Carbon::parse($value)->format('Y-m-d');
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
