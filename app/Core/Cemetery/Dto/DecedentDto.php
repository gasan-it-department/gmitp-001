<?php

namespace App\Core\Cemetery\Dto;

use App\External\Api\Request\Cemetery\DecedentRequest;

final readonly class DecedentDto
{
    public function __construct(
        public string $firstName,
        public string $lastName,
        public ?string $middleName,
        public ?string $suffix,
        public ?string $dateOfBirth,
        public ?string $dateOfDeath,
        public ?string $gender,
        public ?string $causeOfDeath,
        public ?string $deathCertNumber,
        public ?string $notes,
        public string $municipalId,
    ) {
    }

    public static function fromRequest(DecedentRequest $request): self
    {
        $data = $request->validated();
        $municipalId = app('municipal_id');
        return new self(
            firstName: strtoupper(trim($data['first_name'])),
            lastName: strtoupper(trim($data['last_name'])),
            middleName: !empty($data['middle_name']) ? strtoupper(trim($data['middle_name'])) : null,
            suffix: !empty($data['suffix']) ? strtoupper(trim($data['suffix'])) : null,

            // Dates don't need uppercase, just pass them through
            dateOfBirth: $data['date_of_birth'] ?? null,
            dateOfDeath: $data['date_of_death'] ?? null,

            gender: !empty($data['gender']) ? strtoupper(trim($data['gender'])) : null,
            causeOfDeath: !empty($data['cause_of_death']) ? strtoupper(trim($data['cause_of_death'])) : null,
            deathCertNumber: strtoupper(trim($data['death_certificate_no'])),
            notes: !empty($data['notes']) ? strtoupper(trim($data['notes'])) : null,
            municipalId: $municipalId,
        );
    }
}
