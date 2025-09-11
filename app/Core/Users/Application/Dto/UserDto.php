<?php

namespace App\Core\Users\Application\Dto;

use App\Core\Users\Domains\Aggregates\UserAggregate;
class UserDto
{
    public function __construct(
        public string $id,
        public string $uuid,
        public string $userName,
        public string $phone,
        public string $role,
        public string $hashedPassword // still needed for verification
    ) {
    }

    public static function fromUserAggregate(UserAggregate $user): self
    {
        return new self(
            $user->getId(),
            $user->getUuid(),
            $user->getUserName(),
            $user->getPhone(),
            $user->getRole(),
            $user->getPassword()
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'user_name' => $this->userName,
            'phone' => $this->phone,
            'role' => $this->role
        ];
    }

}