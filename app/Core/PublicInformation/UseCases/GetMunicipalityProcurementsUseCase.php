<?php

namespace App\Core\PublicInformation\UseCases;

use App\Core\PublicInformation\Repositories\ProcurementsRepository;

class GetMunicipalityProcurementsUseCase
{

    public function __construct(

        protected ProcurementsRepository $procurementsRepo,

    ) {
    }

    public function execute(string $municipalId)
    {

        return $this->procurementsRepo->getAllPermunicipality($municipalId);

    }

}