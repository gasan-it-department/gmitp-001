<?php

namespace App\Core\ActionCenter\Applications\Dto;


class AssistanceRequestDto
{
    public function __construct(
        public readonly string $id,
        public readonly string $transactionNumber,
        public readonly string $assistanceType,
        public readonly string $description,
        public readonly string $status,
        public readonly string $userId,
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
