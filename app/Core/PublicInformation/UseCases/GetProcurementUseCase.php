<?php

namespace App\Core\PublicInformation\UseCases;

use App\Core\PublicInformation\Repositories\ProcurementsRepository;

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