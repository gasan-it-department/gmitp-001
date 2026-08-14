<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use App\Core\Procurement\Services\ProcurementPublicationValidator;
use Illuminate\Support\Facades\DB;

class PublishedProcurementUseCase
{
    public function __construct(
        private ProcurementsRepository $procurementsRepository,
        private ProcurementPublicationValidator $publicationValidator,
    ) {}

    public function execute(string $municipalId, string $procurementId)
    {
        return DB::transaction(function () use ($municipalId, $procurementId) {
            $procurement = $this->procurementsRepository->lockByIdAndMunicipality(
                $procurementId,
                $municipalId,
            );

            if ($procurement->isPublished()) {
                throw new ProcurementDomainException('This procurement has already been published.');
            }

            if ($procurement->status === ProcurementStatus::DRAFT) {
                throw new ProcurementDomainException('Move this procurement out of Draft before publishing it to citizens.');
            }

            $this->publicationValidator->validate($procurement);

            $procurement->update([
                'published_at' => now(),
            ]);

            return $procurement;
        }, attempts: 3);
    }
}
