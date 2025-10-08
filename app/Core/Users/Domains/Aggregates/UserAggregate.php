<?php

namespace App\Core\Users\Domains\Aggregates;

use App\Core\Users\Domains\ValueObjects\{Phone, Password, UserName, Role};


class UserAggregate
{
    public function __construct(
        public readonly string $id,
        public readonly Phone $phone,
        public readonly UserName $user_name,
        public readonly Password $password,
        public readonly Role $role,
    ) {
    }

    public static function create(
        string $id,
        Phone $phone,
        UserName $user_name,
        Password $password,
        Role $role,
    ): self {
        return new self($id, $phone, $user_name, $password, $role);
    }

    public function withId(string $id): self
    {
        return new self(
            $id,
            $this->phone,
            $this->user_name,
            $this->password,
            $this->role,
        );
    }

    //add business rules here like changing phone and username//

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
            'user_name' => $this->getUserName(),
            'role' => $this->getRole(),
        ];
    }

}