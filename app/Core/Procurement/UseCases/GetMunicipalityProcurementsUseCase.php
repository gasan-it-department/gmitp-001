<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Repositories\ProcurementsRepository;



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