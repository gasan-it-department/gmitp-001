<?php

namespace App\Core\Procurement\Dto;

use Illuminate\Support\Facades\Auth;

readonly class ProcurementDocumentDto
{

    public function __construct(
        public string $municipalId,
        public string $uploadedBy,
        public string $procurementId,
        public string $filePath,
        public string $fileName,
        public string $type,
        public int $fileSize,
        public string $mimeType,
    ) {
    }


    public static function fromRequest(array $validatedData, string $procurementId)
    {
        return new self(
            app('municipal_id'),
            Auth::id(),
            $procurementId,
            $validatedData['file_path'],
            $validatedData['file_name'],
            $validatedData['type'],
            $validatedData['file_size'],
            $validatedData['mime_type'],
        );
    }
}