<?php

namespace App\Core\Users\Domains\Aggregates;

use App\Core\Users\Domains\ValueObjects\{Phone, Password, UserName, Role, FirstName, MiddleName, LastName};


class UserAggregate
{
    public function __construct(
        public readonly string $id,
        public readonly FirstName $first_name,
        public readonly LastName $last_name,
        public readonly MiddleName $middle_name,
        public readonly Phone $phone,
        public readonly UserName $user_name,
        public readonly Password $password,
        public readonly Role $role,
    ) {
    }

    public static function create(
        string $id,
        FirstName $first_name,
        Lastname $last_name,
        MiddleName $middle_name,
        Phone $phone,
        UserName $user_name,
        Password $password,
        Role $role,
    ): self {
        return new self($id, $first_name, $last_name, $middle_name, $phone, $user_name, $password, $role);
    }

    public function withId(string $id): self
    {
        return new self(
            $id,
            $this->first_name,
            $this->last_name,
            $this->middle_name,
            $this->phone,
            $this->user_name,
            $this->password,
            $this->role,
        );
    }

    public function getFirstName()
    {
        return $this->first_name->value();
    }

    public function getLastName(): string
    {
        return $this->last_name->value();
    }
    public function getMiddleName(): string
    {
        return $this->middle_name->value();
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