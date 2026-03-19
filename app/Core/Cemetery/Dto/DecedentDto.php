<?php

namespace App\Core\Cemetery\Dto;

use App\External\Api\Request\Cemetery\DecedentRequest;

final readonly class DecedentDto
{
    public function __construct(
        public ?string $firstName,
        public ?string $lastName,
        public ?string $middleName,
        public ?string $suffix,
        public ?string $gender,
        public ?string $memorialName,

        public ?string $dateOfBirth,
        public ?string $dateOfDeath,
        public string $dateOfRegistration,

        public string $decedentType,
        public ?string $causeOfDeath,
        public ?string $deathCertNumber,
        public ?string $notes,
        public ?string $placeOfDeath,
        public ?string $referenceDocumentNumber, //if the decedent is unknown 
        public ?string $referenceDocumentType, //if the decedent is unknown 

        public string $municipalId,
        public ?string $psgcMunicpalityId,
        public ?string $psgcBarangayId,
        public ?string $streetName
    ) {
    }

    public static function fromRequest(DecedentRequest $request): self
    {
        $data = $request->validated();

        $municipalId = app('municipal_id');
        return new self(
            firstName: filled($data['first_name'])
            ? strtoupper(trim($data['first_name']))
            : null,
            lastName: !empty($data['last_name']) ? strtoupper(trim($data['last_name'])) : null,
            middleName: !empty($data['middle_name']) ? strtoupper(trim($data['middle_name'])) : null,
            suffix: !empty($data['suffix']) ? strtoupper(trim($data['suffix'])) : null,
            gender: !empty($data['gender']) ? strtoupper(trim($data['gender'])) : null,
            memorialName: $data['memorial_name'],

            // Dates don't need uppercase, just pass them through
            dateOfBirth: $data['date_of_birth'] ?? null,
            dateOfDeath: $data['date_of_death'] ?? null,
            dateOfRegistration: $data['date_of_registration'],

            decedentType: $data['decedent_type'],
            causeOfDeath: !empty($data['cause_of_death']) ? strtoupper(trim($data['cause_of_death'])) : null,
            deathCertNumber: strtoupper(trim($data['death_certificate_no'])),
            notes: !empty($data['notes']) ? strtoupper(trim($data['notes'])) : null,
            placeOfDeath: $data['place_of_death'],
            referenceDocumentType: $data['reference_document_type'],
            referenceDocumentNumber: $data['reference_document_number'],

            municipalId: $municipalId,

            psgcMunicpalityId: $data['psgc_municipal_id'],
            psgcBarangayId: $data['psgc_barangay_id'],
            streetName: $data['street_name'],
        );
    }
}
