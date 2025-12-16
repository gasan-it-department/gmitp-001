<?php

namespace App\Core\CommunityReport\Dto;

use Illuminate\Http\Request;
use App\Core\CommunityReport\Enums\CommunityReportType;
use App\External\Api\Request\CommunityReport\CommunityReportRequest;

class CreateReportDto
{
    public function __construct(

        public CommunityReportType $type,

        public readonly string $description,

        public readonly ?string $latitude = null,

        public readonly ?string $longitude = null,

        public readonly ?string $name = null,

        public readonly ?string $contact = null,

        public readonly string $location,

        public readonly ?array $reportFiles,

        public readonly ?string $userId = null,

    ) {
    }

    public static function fromRequest(CommunityReportRequest $request)
    {

        $validated = $request->validated();

        return new self(
            type: CommunityReportType::from($validated['issue_type']),
            description: $validated['description'],
            latitude: $validated['latitude'] ?? null,
            longitude: $validated['longitude'] ?? null,
            name: $validated['sender_name'] ?? null,
            contact: $validated['contact'] ?? null,
            location: $validated['location'],
            reportFiles: $request->file('files') ?? [],
            userId: auth()->id()
        );

    }
}
