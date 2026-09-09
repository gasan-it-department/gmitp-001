<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\UploadAssistanceRequestDocumentsRequest;

readonly class UploadAssistanceRequestDocumentsDto
{
    /** @param array<string, \Illuminate\Http\UploadedFile> $documents */
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public string $actorId,
        public array $documents,
    ) {}

    public static function fromRequest(UploadAssistanceRequestDocumentsRequest $request, string $assistanceRequestId, string $municipalId, string $actorId): self
    {
        return new self($assistanceRequestId, $municipalId, $actorId, $request->file('documents', []));
    }
}
