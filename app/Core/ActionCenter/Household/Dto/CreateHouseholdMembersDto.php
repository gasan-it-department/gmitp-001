<?php

namespace App\Core\ActionCenter\Household\Dto;

use Illuminate\Http\Request;

class CreateHouseholdMembersDto
{

    public function __construct(
        public string $firstName,
        public string $lastName,
        public ?string $middleName,
        public ?string $suffix,
        public string $birthDate,
        public string $relationShip,
    ) {
    }

    public static function fromRequest(Request $request)
    {

        return new self(
        );

    }

}