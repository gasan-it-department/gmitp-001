<?php

namespace App\Core\Municipality\Dto;

use App\Core\Municipality\Enums\HotlineCategory;
use App\External\Api\Request\Municipality\StoreHotlineRequest;

readonly class StoreHotlineDto
{
    public function __construct(
        public string          $municipalId,
        public string          $name,
        public string          $number,
        public HotlineCategory $category,
        public bool            $isActive,
        public int             $sortOrder,
    ) {
    }

    public static function fromRequest(StoreHotlineRequest $request, string $municipalId): self
    {
        return new self(
            municipalId: $municipalId,
            name:        $request->string('name')->toString(),
            number:      $request->string('number')->toString(),
            category:    HotlineCategory::from(strtolower($request->string('category')->toString())),
            isActive:    $request->has('is_active') ? $request->boolean('is_active') : true,
            sortOrder:   $request->has('sort_order') ? (int) $request->input('sort_order') : 0,
        );
    }
}
