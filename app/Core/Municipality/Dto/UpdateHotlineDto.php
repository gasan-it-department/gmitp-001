<?php

namespace App\Core\Municipality\Dto;

use App\Core\Municipality\Enums\HotlineCategory;
use App\External\Api\Request\Municipality\UpdateHotlineRequest;

readonly class UpdateHotlineDto
{
    public function __construct(
        public string           $municipalId,
        public ?string          $name,
        public ?string          $number,
        public ?HotlineCategory $category,
        public ?bool            $isActive,
        public ?int             $sortOrder,
    ) {
    }

    public static function fromRequest(UpdateHotlineRequest $request, string $municipalId): self
    {
        return new self(
            municipalId: $municipalId,
            name:        $request->filled('name')
                ? $request->string('name')->toString()
                : null,
            number:      $request->filled('number')
                ? $request->string('number')->toString()
                : null,
            category:    $request->filled('category')
                ? HotlineCategory::from(strtolower($request->string('category')->toString()))
                : null,
            isActive:    $request->has('is_active')
                ? $request->boolean('is_active')
                : null,
            sortOrder:   $request->has('sort_order')
                ? (int) $request->input('sort_order')
                : null,
        );
    }
}
