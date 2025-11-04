<?php

namespace App\Core\Municipality\Dto;

class AddMunicipalityDto
{
    public function __construct(
        public readonly string $name,
        public readonly string $code,
        public readonly string $regionCode,
        public readonly string $zipCode,
        public readonly bool $isActive = false,
    ) {}
}
