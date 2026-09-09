<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\ReplaceAssistanceAdditionalDocumentRequest;
use Illuminate\Http\UploadedFile;

readonly class ReplaceAssistanceAdditionalDocumentDto
{
    public function __construct(
        public string $assistanceRequestId,
        public int $mediaId,
        public string $municipalId,
        public string $actorId,
        public UploadedFile $document,
    ) {}

    public static function fromRequest(
        ReplaceAssistanceAdditionalDocumentRequest $request,
        string $assistanceRequestId,
        int $mediaId,
        string $municipalId,
        string $actorId,
    ): self {
        /** @var UploadedFile $document */
        $document = $request->file('document');

        return new self($assistanceRequestId, $mediaId, $municipalId, $actorId, $document);
    }
}
