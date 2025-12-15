<?php

namespace App\Core\PublicInformation\UseCases;

use Illuminate\Support\Facades\DB;
use App\Core\PublicInformation\Dto\StoreProcurementsDto;
use App\Shared\FileUploader\CloudinaryFileUploadService;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use App\Core\PublicInformation\Repositories\ProcurementsRepository;


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

            return $this->procurementsRepo->save($dto, $procurementId);

            if (!empty($dto->files)) {

                foreach ($dto->files as $index => $file) {

                    $fileId = $this->idGenerator->generate();

                    $folder = 'procurements_files/' . $procurementId;

                    $fileData = $this->fileUploadService->uploadFiles($file, $folder);

                    $fileType = $dto->fileTypes[$index] ?? 'DOCUMENT';

                    $this->procurementsRepo->saveFiles(

                        fileData: $fileData,

                        procurementId: $procurementId,

                        type: $fileType,

                        fileId: $fileId

                    );

                }

            }

        });
    }

}