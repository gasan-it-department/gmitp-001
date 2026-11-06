<?php

namespace App\Shared\Aga\Dto;

readonly class AgaNotificationDto
{
    public function __construct(
        public string $title,
        public string $message,
        public ?string $eventType = null,
        public string $audience = 'all',
        public array $userIds = [],
        public ?string $imageUrl = null,
        public string $schema = 'test',
    ) {}

    public function toArray(): array
    {
        $payload = [
            'schema' => $this->schema,
            'audience' => $this->audience,
            ...($this->eventType !== null && trim($this->eventType) !== '' ? ['event_type' => trim($this->eventType)] : []),
            'title' => $this->title,
            'message' => $this->message,
        ];

        if ($this->audience === 'specific') {
            $payload['user_ids'] = array_values($this->userIds);
        }
        if ($this->imageUrl !== null) {
            $payload['image_url'] = $this->imageUrl;
        }

        return $payload;
    }
}
