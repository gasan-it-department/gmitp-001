<?php

namespace App\Core\Users\Dto;

use App\External\Api\Request\Auth\CreateAdminRequest;

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

    ) {
    }

    public static function fromRequest(CreateAdminRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            firstName: $validated['first_name'],
            middleName: $validated['middle_name'] ?? null,
            lastName: $validated['last_name'],
            userName: $validated['user_name'],
            phone: $validated['phone'],
            email: $validated['email'],
            municipalId: $validated['municipal_id'],
            password: $validated['password'],
            permissions: $validated['permission'] ?? null,
        );
    }
}