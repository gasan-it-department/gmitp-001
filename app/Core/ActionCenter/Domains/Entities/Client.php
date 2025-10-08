<?php

namespace App\Core\ActionCenter\Domains\Entities;

use App\Core\ActionCenter\Domains\ValueObjects\{ClientId};
final class Client
{

    public function __construct(
        private ClientId $id,
        private string $name,
        private int $age,
        private string $contactNumber,
        private string $address,
        private array $assistanceRequests = []
    ) {
    }

    public function getId(): ClientId
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }
    public function getAge(): int
    {
        return $this->age;
    }

    public function getContactNumber(): string
    {
        return $this->contactNumber;
    }

    public function getAddress(): string
    {
        return $this->address;
    }


}