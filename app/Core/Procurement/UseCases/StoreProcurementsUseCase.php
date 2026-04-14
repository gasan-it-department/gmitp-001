<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Dto\StoreProcurementsDto;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use App\Core\Procurement\Services\ProcurementTimelineValidator;
use App\Shared\FileUploader\Interface\MediaUploadInterface;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;
class StoreProcurementsUseCase
{

    public function __construct(

        protected ProcurementsRepository $procurementsRepo,

        protected IdGeneratorInterface $idGenerator,

        protected MediaUploadInterface $pdfUploadService,

        protected ProcurementTimelineValidator $procurementTimelineValidator

    ) {
    }

    public function execute(StoreProcurementsDto $dto)
    {
        $procurementId = $this->idGenerator->generate();

        return DB::transaction(function () use ($dto, $procurementId) {

            $this->procurementTimelineValidator->validateSequence($dto->preBidDate, $dto->closingDate);

            $procurement = $this->procurementsRepo->save($dto, $procurementId);

            return $procurement;
        });
    }


}
