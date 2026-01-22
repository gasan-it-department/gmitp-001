<?php

namespace App\Core\Cemetery\Interments\Dto;

use App\External\Api\Request\Cemetery\IntermentRequest;

class AddIntermentsDto
{
    public function __construct(

        public string $firstName,

        public string $lastName,

        public ?string $middleName = null, // FIXED: Made nullable to prevent crash

        public ?string $extensionName = null,

        public ?string $dateOfBirth = null,

        public ?string $dateOfDeath = null,

        public ?string $gender = null,

        public ?string $causeOfDeath = null,

        public ?string $deathCertificateNo = null,

        public ?string $notes = null,

    ) {

    }

    public static function fromRequest(IntermentRequest $request): self
    {
        $data = $request->validated();

        return new self(
            firstName: strtoupper($data['first_name']),
            lastName: strtoupper($data['last_name']),
            middleName: isset($data['middle_name']) ? strtoupper($data['middle_name']) : null,
            extensionName: $data['extension_name'] ?? null,
            dateOfBirth: $data['date_of_birth'] ?? null,
            dateOfDeath: $data['date_of_death'] ?? null,
            gender: $data['gender'] ?? null,
            causeOfDeath: $data['cause_of_death'] ?? null,
            deathCertificateNo: $data['death_certificate_number'] ?? null,
            notes: $data['notes'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'first_name' => $this->firstName,
            'last_name' => $this->lastName,
            'middle_name' => $this->middleName,
            'extension_name' => $this->extensionName,
            'date_of_birth' => $this->dateOfBirth,
            'date_of_death' => $this->dateOfDeath,
            'gender' => $this->gender,
            'cause_of_death' => $this->causeOfDeath,
            'death_certificate_no' => $this->deathCertificateNo,
            'notes' => $this->notes,
        ];
    }
}