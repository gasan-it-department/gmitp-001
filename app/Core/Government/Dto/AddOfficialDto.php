<?php

namespace App\Core\Government\Officials\Dto;

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

    ) {
    }

    public static function fromRequest(OfficialRequest $request): self
    {

        $data = $request->validated();

        return new self(
            $data['first_name'],
            $data['last_name'],
            $data['middle_name'],
            $data['suffix'],
            $data['biography'],
            $data['gender'],
        );

    }

}