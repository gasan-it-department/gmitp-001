<?php

namespace App\Core\Procurement\UseCases\Document;

use App\Core\Procurement\Constants\ProcurementFolders;
use App\Core\Procurement\Exceptions\ProcurementDocumentException;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use App\Core\Procurement\Services\ProcurementDocumentService;
use App\Shared\FileUploader\GeneratePresignedUrlService;
use App\Shared\Storage\Enums\StorageModules;
use App\Shared\Storage\Helper\StoragePath;
use Illuminate\Support\Str;

class GenerateDocumentUploadUrlUseCase
{
    public function __construct(
        private GeneratePresignedUrlService $urlService,
        private ProcurementsRepository $procurementsRepo,
        private ProcurementDocumentService $documentService,
    ) {
    }

    public function execute(string $municipalId, string $procurementId, string $extension, string $contentType)
    {
        $currentCount = $this->procurementsRepo->getDocumentCount($procurementId, $municipalId);

        if (!$this->documentService->isWithinLimit($currentCount)) {
            throw ProcurementDocumentException::limitExceeded($currentCount);
        }

        $filename = Str::ulid() . '.' . $extension;

        $storagePath = StoragePath::for($municipalId)
            ->resolveResource(
                StorageModules::Procurement,
                $procurementId,
                ProcurementFolders::DOCUMENTS,
                $filename
            );

        $uploadUrl = $this->urlService->execute(
            's3',
            $storagePath,
            $contentType,
            15,
        );

        return [
            'upload_url' => $uploadUrl['url'],
            'storage_path' => $storagePath,
        ];
    }
}