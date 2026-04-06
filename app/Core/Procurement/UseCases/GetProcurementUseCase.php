<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Repositories\ProcurementsRepository;


class GetProcurementUseCase
{

    public function __construct(

        protected ProcurementsRepository $procurementsRepo

    ) {
    }

    public function execute(string $procurementId, string $municipalId)
    {
        return $this->procurementsRepo->findByIdAndMunicipality($procurementId, $municipalId);
    }

}