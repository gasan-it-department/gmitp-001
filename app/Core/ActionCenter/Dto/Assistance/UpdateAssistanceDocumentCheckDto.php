<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\Core\ActionCenter\Enums\PhysicalCopyRequirement;
use App\External\Api\Request\ActionCenter\UpdateAssistanceDocumentCheckRequest;

readonly class UpdateAssistanceDocumentCheckDto
{
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public string $actorId,
        public string $documentKey,
        public string $status,
        public ?int $mediaId,
        public ?string $mediaVersion,
        public ?PhysicalCopyRequirement $presentedCopyType,
        public bool $physicalInspected,
        public ?string $remarks,
    ) {}

    public static function fromRequest(UpdateAssistanceDocumentCheckRequest $request, string $assistanceRequestId, string $documentKey, string $municipalId, string $actorId): self
    {
        $presentedCopyType = $request->validated('presented_copy_type');

        return new self(
            $assistanceRequestId,
            $municipalId,
            $actorId,
            $documentKey,
            $request->validated('status'),
            $request->validated('media_id'),
            $request->validated('media_version'),
            $presentedCopyType !== null
                ? PhysicalCopyRequirement::from($presentedCopyType)
                : null,
            $request->boolean('physical_inspected'),
            $request->validated('remarks'),
        );
    }
}
