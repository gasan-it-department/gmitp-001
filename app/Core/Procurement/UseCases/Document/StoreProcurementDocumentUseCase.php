<?php

namespace App\Core\Procurement\UseCases\Document;

use App\Core\Procurement\Dto\ProcurementDocumentDto;
use App\Core\Procurement\Exceptions\ProcurementDocumentException;
use App\Core\Procurement\Models\ProcurementDocument;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use App\Core\Procurement\Services\ProcurementDocumentService;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use App\Shared\IdGenerator\Services\IdGenerator;

class StoreProcurementDocumentUseCase
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
        private ProcurementsRepository $procurementsRepo,
        private ProcurementDocumentService $procurementDocumentService,
    ) {
    }

    public function execute(ProcurementDocumentDto $dto)
    {
        $currentCount = $this->procurementsRepo->getDocumentCount($dto->procurementId, $dto->municipalId);

        if (!$this->procurementDocumentService->isWithinLimit($currentCount)) {
            throw ProcurementDocumentException::limitExceeded($currentCount);
        }

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