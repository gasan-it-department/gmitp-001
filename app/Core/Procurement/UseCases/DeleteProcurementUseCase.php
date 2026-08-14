<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use Illuminate\Support\Facades\DB;

class DeleteProcurementUseCase
{
    public function __construct(
        private ProcurementsRepository $procurementsRepo,
    ) {}

    public function execute(string $municipalId, string $procurementId): void
    {
        DB::transaction(function () use ($municipalId, $procurementId) {
            $procurement = $this->procurementsRepo->lockByIdAndMunicipality($procurementId, $municipalId);

            if ($procurement->isPublished()) {
                throw new ProcurementDomainException('Published procurement records cannot be deleted.');
            }

            $this->procurementsRepo->deleteProcurement($procurement);
        }, attempts: 3);
    }
}
