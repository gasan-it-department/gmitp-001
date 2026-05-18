<?php

namespace App\Core\ActionCenter\Dto\Household;

readonly class CreateInlineHouseholdMemberDto
{
    public function __construct(
        public string $householdId,
        public string $firstName,
        public string $lastName,
        public ?string $middleName,
        public ?string $suffix,
        public ?string $relationship,
        public ?string $birthDate,
        public ?string $sex,
    ) {
    }

    public static function fromArray(array $data, string $householdId): self
    {
        return new self(
            householdId: $householdId,
            firstName: mb_strtoupper($data['first_name']),
            lastName: mb_strtoupper($data['last_name']),
            middleName: ! empty($data['middle_name']) ? mb_strtoupper($data['middle_name']) : null,
            suffix: ! empty($data['suffix']) ? mb_strtoupper($data['suffix']) : null,
            relationship: $data['relationship'] ?? null,
            birthDate: $data['birth_date'] ?? null,
            sex: $data['sex'] ?? null,
        );
    }
}
