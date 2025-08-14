<?php

namespace App\Core\ActionCenter\Applications\Dto;

class AssistanceRequestDto
{
    public function __construct(
        public readonly string $name,
        public readonly string $age,
        public readonly string $address,
        public readonly string $description,
        public readonly string $assistanceType,//later change the readonly string to valueobject assistance type.
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            age: $data['age'],
            address: $data['address'],
            description: $data['description'],
            assistanceType: $data['assistanceType'],
        );
    }
}
