<?php

namespace App\Core\Users\Dto;

use App\External\Api\Request\Auth\CreateUserRequest;

class RegisterUserDto
{
    public function __construct(

        public readonly string $firstName,

        public readonly ?string $middleName,

        public readonly string $lastName,

        public readonly string $userName,

        public readonly string $phone,

        public readonly string $password,
    ) {
    }

    public static function fromRequest(CreateUserRequest $request)
    {

        $validated = $request->validated();

        return new self(
            firstName: strtoupper($validated['first_name']),
            middleName: strtoupper($validated['middle_name']),
            lastName: strtoupper($validated['last_name']),
            userName: $validated['user_name'],
            phone: $validated['phone'],
            password: $validated['password'],
        );

    }
}