<?php

namespace App\Core\ActionCenter\Applications\Dto;

class BeneficiaryDto
{
    public function __construct(
        public readonly string $id,
        public readonly string $firstName,
        public readonly string $lastName,
        public readonly ?string $middleName,
        public readonly ?string $suffix,
        public readonly string $birthDate,
        public readonly string $contactNumber,
        public readonly string $province,
        public readonly string $municipality,
        public readonly string $barangay,
    ) {

    }
}