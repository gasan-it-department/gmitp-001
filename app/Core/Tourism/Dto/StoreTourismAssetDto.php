<?php

namespace App\Core\Tourism\Dto;

use App\External\Api\Request\Tourism\StoreTourismAssetRequest;
use Illuminate\Http\UploadedFile;

readonly class StoreTourismAssetDto
{

    public function __construct(
        public string $municipal_id, // Usually pulled from auth or route
        public string $category_id,
        public string $type,
        public string $name,
        public string $short_description,
        public ?string $description,
        public bool $is_published,
        public ?array $meta,

        // Media Files
        public ?UploadedFile $cover,
        /** @var UploadedFile[]|null */
        public ?array $gallery,
    ) {
    }

    public static function fromRequest(StoreTourismAssetRequest $request, string $municipalId)
    {
        return new self(
            municipal_id: $municipalId,
            category_id: $request->validated('category_id'),
            type: $request->validated('type'),
            name: $request->validated('name'),
            short_description: $request->validated('short_description'),
            description: $request->validated('description'),
            is_published: $request->validated('is_published', false), // Default to false
            meta: $request->validated('meta'), // Laravel automatically passes this as an array!

            cover: $request->file('cover'),
            gallery: $request->file('gallery'),
        );
    }
}