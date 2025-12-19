<?php

namespace App\Core\Users\Dto;

use Illuminate\Http\Request;

class CreateAdminDto
{
    public function __construct(

        public readonly string $firstName,
        public readonly ?string $middleName,
        public readonly string $lastName,
        public readonly string $userName,
        public readonly string $phone,
        public readonly string $email,
        public readonly string $municipalId,
        public readonly string $password,
        public readonly ?array $permissions = null,
        public readonly ?\DateTimeImmutable $verified = null,
    ) {
    }

    public static function fromRequest(Request $request)
    {

        return new self(

            firstName: $request->get('first_name'),
            middleName: $request->get('middle_name'),
            lastName: $request->get('last_name'),
            userName: $request->get('user_name'),
            phone: $request->get('phone'),
            email: $request->get('email'),
            municipalId: $request->get('municipal_id'),
            password: $request->get('password'),
            permissions: $request->get('permission'),
        );

    }
}