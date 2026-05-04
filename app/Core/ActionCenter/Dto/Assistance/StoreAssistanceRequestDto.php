<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\Core\ActionCenter\Enums\Sex;
use App\External\Api\Request\ActionCenter\StoreAssistanceRequest;

readonly class StoreAssistanceRequestDto
{

    public function __construct(
        public string $barangay,
        public ?string $street,

        public string $firstName,
        public string $lastName,
        public string $birthDate,
        public Sex $sex,
        public ?string $middleName,

        public string $contactNumber,
        public string $submitterTypeId,
        public string $assistanceTypeId,
        public string $description,

        public array $documents,
        public bool $privacyConsent,

        public string $municipalId,
        public ?string $encodedByUserId,

    ) {
    }

    public static function fromRequest(StoreAssistanceRequest $request): self
    {
        return new self(
            // Mapping snake_case request data to camelCase properties
            barangay: $request->validated('barangay'),
            street: $request->validated('street_or_purok'),

            firstName: $request->validated('first_name'),
            lastName: $request->validated('last_name'),
            birthDate: $request->validated('birth_date'),
            sex: Sex::from($request->validated('sex')), // Safely casts to Enum
            middleName: $request->validated('middle_name'),

            contactNumber: $request->validated('contact_number'),
            // Hardcoding 'Self' or grabbing from request depending on your flow
            submitterTypeId: $request->validated('submitter_type_id', 'Self'),
            assistanceTypeId: $request->validated('assistance_type_id'),
            description: $request->validated('description'),

            documents: $request->file('documents', []),
            privacyConsent: $request->validated('privacy_consent'),

            // System Context injected directly from the authenticated user session
            municipalId: $request->user()->municipal_id,
            encodedByUserId: $request->user()->id,
        );
    }

}