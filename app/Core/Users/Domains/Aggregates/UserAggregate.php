<?php

namespace App\Core\Users\Domains\Aggregates;

use App\Core\Users\Domains\ValueObjects\{Phone, Password, UserName, Role, Uuid};


class UserAggregate
{
    public function __construct(
        public readonly Uuid $uuid,
        public readonly Phone $phone,
        public readonly UserName $user_name,
        public readonly Password $password,
        public readonly Role $role,
        public ?int $id = null
    ) {
    }

    public static function create(
        ?int $id,
        Uuid $uuid,
        Phone $phone,
        UserName $user_name,
        Password $password,
        Role $role,
    ): self {
        return new self($uuid, $phone, $user_name, $password, $role, $id);
    }

    public function withUuid(Uuid $uuid): self
    {
        // Assuming the Eloquent model returns an ID after saving
        return new self(
            $uuid,
            $this->phone,
            $this->user_name,
            $this->password,
            $this->role
        );
    }

    public function withId(int $id): self
    {
        return new self(
            $this->uuid,
            $this->phone,
            $this->user_name,
            $this->password,
            $this->role,
        );
    }

    //add business rules here like changing phone and username//

    public function getUuid(): string
    {
        return $this->uuid;
    }

    public function getId(): ?int
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
            'uuid' => $this->getUuid(),
            'user_name' => $this->getUserName(),
            'role' => $this->getRole(),
        ];
    }

}