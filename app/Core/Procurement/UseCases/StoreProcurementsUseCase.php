<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Dto\StoreProcurementsDto;
use App\Core\Procurement\Enums\ProcurementDocumentType;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use App\Core\Procurement\Services\ProcurementTimelineValidator;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;

class StoreProcurementsUseCase
{
    public function __construct(

        protected ProcurementsRepository $procurementsRepo,

        protected IdGeneratorInterface $idGenerator,

        protected ProcurementTimelineValidator $procurementTimelineValidator

    ) {}

    public function execute(StoreProcurementsDto $dto)
    {
        $procurementId = $this->idGenerator->generate();

        return DB::transaction(function () use ($dto, $procurementId) {

            $this->procurementTimelineValidator->validateSequence($dto->preBidDate, $dto->closingDate);

            $procurement = $this->procurementsRepo->save($dto, $procurementId);

            foreach ($dto->documents as $document) {
                $type = $document['type'] instanceof ProcurementDocumentType
                    ? $document['type']
                    : ProcurementDocumentType::from($document['type']);

                $normallyAllowed = in_array($procurement->status, $type->allowedStatuses(), true);
                $historicalBaseDocument = $procurement->status !== ProcurementStatus::DRAFT
                    && $type->isPublicBidDocument();

                if (! $normallyAllowed && ! $historicalBaseDocument) {
                    throw new ProcurementDomainException(
                        "The document type '{$type->label()}' is not allowed for a {$procurement->status->label()} procurement."
                    );
                }

                $procurement->addMedia($document['file'])
                    ->toMediaCollection($type->value);
            }

            return $procurement;
        }, attempts: 3);
    }
}
