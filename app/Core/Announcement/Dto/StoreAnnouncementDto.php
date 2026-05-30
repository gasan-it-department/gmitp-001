<?php

namespace App\Core\Announcement\Dto;

use App\Core\Announcement\Enums\AnnouncementType;
use App\External\Api\Request\Announcement\StoreAnnouncementRequest;

readonly class StoreAnnouncementDto
{
    public function __construct(
        public string             $municipalId,
        public ?string            $userId,
        public string             $title,
        public string             $content,
        public AnnouncementType   $type,
        public bool               $isPublished,
        /** @var array<int, \Illuminate\Http\UploadedFile> */
        public array              $images = [],
    ) {
    }

    public static function fromRequest(StoreAnnouncementRequest $request, string $municipalId): self
    {
        return new self(
            municipalId: $municipalId,
            userId:      $request->user()?->id,
            title:       $request->string('title')->toString(),
            content:     $request->string('content')->toString(),
            type:        AnnouncementType::from(strtolower($request->string('type')->toString())),
            isPublished: $request->boolean('is_published'),
            images:      $request->file('images', []) ?? [],
        );
    }
}
