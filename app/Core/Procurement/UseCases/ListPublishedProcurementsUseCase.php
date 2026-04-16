<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Dto\ProcurementFilterDto;
use App\Core\Procurement\Repositories\ProcurementsRepository;

class ListPublishedProcurementsUseCase
{

    public function __construct(

        protected ProcurementsRepository $procurementsRepo,

    ) {
    }

    public function execute(string $municipalId, ProcurementFilterDto $dto)
    {

        return $this->procurementsRepo->getTransparencyPortalList($municipalId, $dto);

    }

}