<?php

namespace App\Core\BulletinBoard\Events\Dto;

use Illuminate\Http\Request;

class EventsQueryDto
{
    public function __construct(

        public readonly ?int $perPage = 30,

        public readonly ?string $orderBy = 'created_at',

        public readonly ?string $direction = 'desc',

        public readonly ?string $search = null,

        public readonly ?bool $isPublished = true,

    ) {
    }

    public static function fromRequest(Request $request): self
    {
        return new self(
            // Use logical defaults and correct request keys
            perPage: (int) $request->query('per_page', 15),
            orderBy: $request->query('order_by', 'created_at'),
            direction: $request->query('direction', 'desc'),
            search: $request->query('search'),
        );
    }
}