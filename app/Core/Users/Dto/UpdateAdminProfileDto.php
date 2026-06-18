<?php

namespace App\Core\Users\Dto;

use App\External\Api\Request\Auth\UpdateAdminRequest;

class UpdateAdminProfileDto
{
    public function __construct(

        public readonly string $id,

        public readonly string $firstName,

        public readonly ?string $middleName,

        public readonly string $lastName,

        public readonly string $phone,

        public readonly ?string $email,

        public readonly string $municipalId,

        public readonly ?string $password,

        public readonly ?array $permissions = null,

    ) {}

    public static function fromRequest(UpdateAdminRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            id: $request->route('id'),
            firstName: strtoupper($validated['first_name']),
            middleName: isset($validated['middle_name']) ? strtoupper($validated['middle_name']) : null,
            lastName: strtoupper($validated['last_name']),
            phone: $validated['phone'],
            email: $validated['email'] ?? null,
            municipalId: $validated['municipal_id'],
            password: $validated['password'] ?? null,
            permissions: $validated['permission'] ?? null,
        );
    }
}
