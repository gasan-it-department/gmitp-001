<?php

namespace App\Core\Tourism\Dto;

use App\External\Api\Request\Tourism\StoreTourismCategoryRequest;

readonly class StoreCategoryDto
{
    public function __construct(
        public string $municipalId,
        public string $name,
        public string $type,
        public ?string $description,

    ) {
    }

    public static function fromRequest(StoreTourismCategoryRequest $request)
    {
        return new self(
            municipalId: app('municipal_id'),
            name: $request->validated('name'),
            type: $request->validated('type'),
            description: $request->validated('description'),
        );
    }
}