<?php

namespace App\Core\Government\Dto;

use App\External\Api\Request\Government\OfficialRequest;

class AddOfficialDto
{

    public function __construct(

        public string $firstName,

        public string $lastName,

        public ?string $middleName = null,

        public ?string $suffix = null,

        public ?string $biography = null,

        public ?string $gender = null,

        public string $municipalId,

    ) {
    }

    public static function fromRequest(OfficialRequest $request): self
    {

        $data = $request->validated();

        return new self(
            firstName: self::sanitize($data['first_name']),
            lastName: self::sanitize($data['last_name']),
            middleName: self::sanitize($data['middle_name']),
            suffix: self::sanitize($data['suffix']),
            biography: $data['biography'],
            gender: $data['gender'],
            municipalId: app('municipal_id'),
        );

    }

    public static function sanitize($value): string
    {

        return strtoupper(trim($value ?? ''));

    }

}