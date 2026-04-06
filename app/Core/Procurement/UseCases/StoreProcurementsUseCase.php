<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Dto\StoreProcurementsDto;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use App\Shared\FileUploader\Interface\MediaUploadInterface;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;
use Exception;

class StoreProcurementsUseCase
{

    public function __construct(

        protected ProcurementsRepository $procurementsRepo,

        protected IdGeneratorInterface $idGenerator,

        protected MediaUploadInterface $pdfUploadService,

    ) {
    }

    public function execute(StoreProcurementsDto $dto)
    {
        $procurementId = $this->idGenerator->generate();

        return DB::transaction(function () use ($dto, $procurementId) {

            $procurement = $this->procurementsRepo->save($dto, $procurementId);


            if (!empty($dto->documents)) {

                $folderPath = $this->pdfUploadService->getFolderPath($dto->municipalId, 'procurements', $procurementId);

                $uploadedPaths = [];
                try {
                    foreach ($dto->documents as $document) {

                        $file = $document['file'];
                        $type = $document['type'];
                        $pdfId = $this->idGenerator->generate();

                        $uploadResult = $this->pdfUploadService->uploadMedia(
                            $file,
                            $folderPath,
                            $file->getClientOriginalName()
                        );
                        $uploadedPaths[] = $uploadResult['file_path'];

                        $this->procurementsRepo->saveFiles($uploadResult, $procurementId, $type, $pdfId, $dto->createdBy);

                    }

                } catch (Exception $e) {
                    foreach ($uploadedPaths as $path) {
                        $this->pdfUploadService->deleteMedia($path);
                    }
                    throw $e;
                }
            }
            return $procurement;
        });
    }


}
