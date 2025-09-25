<?php

namespace App\Core\ActionCenter\Applications\Dto;

class AssistanceRequestDto
{
    public function __construct(
        public readonly string $firstName,
        public readonly string $lastName,
        public readonly ?string $middleName,
        public readonly ?string $suffix,
        public readonly string $contactNumber,
        public readonly string $province,
        public readonly string $municipality,
        public readonly string $barangay,
        public readonly string $assistanceNeeded,
    ) {
    }


    // public static function fromArray(array $data): self
    // {
    //     return new self(
    //         name: $data['name'],
    //         age: $data['age'],
    //         address: $data['address'],
    //         description: $data['description'],
    //         assistanceType: $data['assistanceType'],
    //     );
    // }
}
