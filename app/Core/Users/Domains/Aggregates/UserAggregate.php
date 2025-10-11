<?php

namespace App\Core\Users\Domains\Aggregates;

use App\Core\Users\Domains\ValueObjects\{Phone, Password, UserName, Role};


class UserAggregate
{
    public function __construct(
        public readonly string $id,
        public readonly string $name,
        public readonly Phone $phone,
        public readonly UserName $user_name,
        public readonly Password $password,
        public readonly Role $role,
    ) {
    }

    public static function create(
        string $id,
        string $name,
        Phone $phone,
        UserName $user_name,
        Password $password,
        Role $role,
    ): self {
        return new self($id, $name, $phone, $user_name, $password, $role);
    }

    public function withId(string $id): self
    {
        return new self(
            $id,
            $this->name,
            $this->phone,
            $this->user_name,
            $this->password,
            $this->role,
        );
    }

    public function getName()
    {
        return $this->name;
    }
    public function getId(): string
    {
        return $this->id;
    }
    public function getUserName(): string
    {
        return $this->user_name->getValue();
    }
    public function getPhone(): string
    {
        return $this->phone->getValue();
    }
    public function getPassword(): string
    {
        return $this->password->getValue();
    }
    public function getRole(): string
    {
        return $this->role->getValue();
    }

    public function verifyPassword(string $password): bool
    {
        return $this->password->verify($password);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'user_name' => $this->getUserName(),
            'role' => $this->getRole(),
        ];
    }

}