<?php

namespace App\Core\ActionCenter\Requests\UseCase;

use App\Core\ActionCenter\Requests\Repositories\AssistanceRequestFilesRepositories;
use App\Shared\FileUploader\Interface\FileUploadInterface;
use Illuminate\Support\Facades\DB;
use App\Shared\IdGenerator\Services\IdGenerator;
use App\Core\ActionCenter\Requests\Enums\RequestStatus;
use App\Core\ActionCenter\Requests\Dto\CreateAssistanceDto;
use App\Core\ActionCenter\Requests\Services\TransactionNumberGenerator;
use App\Core\ActionCenter\Requests\Repositories\AssistanceRequestRepositories;

class CreateAssistanceRequestUseCase
{
    public function __construct(

        protected AssistanceRequestRepositories $assistanceRepo,

        protected IdGenerator $idGenerator,

        protected TransactionNumberGenerator $transactionNumber,

        protected FileUploadInterface $fileUploadInterface,

        protected AssistanceRequestFilesRepositories $assistanceRequestFilesRepo,

    ) {
    }

    public function execute(CreateAssistanceDto $dto, string $municipalId)
    {

        return DB::transaction(function () use ($dto, $municipalId) {

            $assistanceId = $this->idGenerator->generate();

            $transactionNumber = $this->transactionNumber->generate();

            $status = RequestStatus::PENDING;

            $assistance = $this->assistanceRepo->save(

                status: $status,

                dto: $dto,

                assistanceId: $assistanceId,

                transactionNumber: $transactionNumber,

                municipalId: $municipalId,

            );

            if (!empty($dto->files)) {

                $folder = 'assistance_files/' . $assistanceId;

                foreach ($dto->files as $file) {

                    $fileData = $this->fileUploadInterface->uploadFiles($file, $folder);

                    $this->assistanceRequestFilesRepo->create($fileData, $assistanceId);

                }

            }


            return $assistance;

        });

    }

}