<?php

namespace App\Core\ActionCenter\Domains\Entities;

use App\Core\ActionCenter\Domains\Entities\Client;
use App\Core\ActionCenter\Domains\Enums\AssistanceType;
final class AssistanceRequest
{
    public function __construct(
        private string $id,
        private Client $client,
        private AssistanceType $assistanceType,

    ) {
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getClient(): Client
    {
        return $this->client;
    }

    public function getAssistanceType(): AssistanceType
    {
        return $this->assistanceType;
    }
}