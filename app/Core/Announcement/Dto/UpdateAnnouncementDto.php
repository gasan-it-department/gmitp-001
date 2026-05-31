<?php

namespace App\Core\Announcement\Dto;

use App\Core\Announcement\Enums\AnnouncementType;
use App\External\Api\Request\Announcement\UpdateAnnouncementRequest;

readonly class UpdateAnnouncementDto
{
    public function __construct(
        public string             $municipalId,
        public ?string            $title,
        public ?string            $content,
        public ?AnnouncementType  $type,
        public ?bool              $isPublished,
        /** @var array<int, \Illuminate\Http\UploadedFile> */
        public array              $images = [],
    ) {
    }

    public static function fromRequest(UpdateAnnouncementRequest $request, string $municipalId): self
    {
        return new self(
            municipalId: $municipalId,
            title:       $request->filled('title') ? $request->string('title')->toString() : null,
            content:     $request->filled('content') ? $request->string('content')->toString() : null,
            type:        $request->filled('type')
                ? AnnouncementType::from(strtolower($request->string('type')->toString()))
                : null,
            isPublished: $request->has('is_published') ? $request->boolean('is_published') : null,
            images:      $request->file('images', []) ?? [],
        );
    }
}
