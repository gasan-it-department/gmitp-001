<?php

namespace App\Core\Procurement\UseCases\Document;

use App\Core\Procurement\Dto\ProcurementDocumentDto;
use App\Core\Procurement\Models\ProcurementDocument;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use App\Shared\IdGenerator\Services\IdGenerator;

class StoreProcurementDocumentUseCase
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {
    }

    public function execute(ProcurementDocumentDto $dto)
    {

        return ProcurementDocument::create([
            'id' => $this->idGenerator->generate(),
            'procurement_id' => $dto->procurementId,
            'uploaded_by' => $dto->uploadedBy,
            'file_path' => $dto->filePath,
            'type' => $dto->type,
            'file_name' => $dto->fileName,
            'file_size' => $dto->fileSize,
            'mime_type' => $dto->mimeType,
        ]);

    }
}