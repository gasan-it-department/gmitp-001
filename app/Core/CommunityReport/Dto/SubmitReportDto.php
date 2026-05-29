<?php

namespace App\Core\CommunityReport\Dto;

use App\Core\CommunityReport\Enums\ReportCategory;
use App\External\Api\Request\CommunityReport\SubmitReportRequest;

readonly class SubmitReportDto
{
    public function __construct(
        public string         $municipalId,
        public ?string        $userId,
        public ReportCategory $category,
        public string         $locationText,
        public ?float         $latitude,
        public ?float         $longitude,
        public string         $description,
        public bool           $isAnonymous,
        /** @var array<int, \Illuminate\Http\UploadedFile> */
        public array          $evidencePhotos = [],
    ) {
    }

    public static function fromRequest(SubmitReportRequest $request, string $municipalId): self
    {
        return new self(
            municipalId:    $municipalId,
            userId:         $request->user()?->id,
            category:       ReportCategory::from(strtolower($request->string('category')->toString())),
            locationText:   $request->string('location_text')->toString(),
            latitude:       $request->filled('latitude') ? (float) $request->input('latitude') : null,
            longitude:      $request->filled('longitude') ? (float) $request->input('longitude') : null,
            description:    $request->string('description')->toString(),
            isAnonymous:    $request->boolean('is_anonymous'),
            evidencePhotos: $request->file('evidence_photos', []) ?? [],
        );
    }
}
