<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Dto\StoreProcurementsDto;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use App\Shared\FileUploader\CloudinaryFileUploadService;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;


class StoreProcurementsUseCase
{

    public function __construct(

        protected ProcurementsRepository $procurementsRepo,

        protected IdGeneratorInterface $idGenerator,

        protected CloudinaryFileUploadService $fileUploadService,

    ) {
    }

    public function execute(StoreProcurementsDto $dto)
    {
        $procurementId = $this->idGenerator->generate();

        return DB::transaction(function () use ($dto, $procurementId) {

            $procurement = $this->procurementsRepo->save($dto, $procurementId);


            if (!empty($dto->attachments)) {

                foreach ($dto->attachments as $index => $attachment) {

                    $fileObject = $attachment['file'];

                    $docType = $attachment['type'];

                    $fileId = $this->idGenerator->generate();

                    $folder = 'procurements_files/' . $procurementId;

                    $fileData = $this->fileUploadService->uploadFiles($fileObject, $folder);

                    $this->procurementsRepo->saveFiles(

                        fileData: $fileData,

                        procurementId: $procurementId,

                        type: $docType,

                        fileId: $fileId

                    );

                }

            }
            return $procurement;
        });
    }

}