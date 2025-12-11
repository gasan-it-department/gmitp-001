<?php

namespace App\External\Api\Controllers\PublicInformation;

use App\Core\PublicInformation\Dto\StoreProcurementsDto;
use App\Core\PublicInformation\UseCases\StoreProcurementsUseCase;
use App\External\Api\Request\PublicInformation\ProcurementRequest;

class ProcurementsController
{

    public function __construct(

        private StoreProcurementsUseCase $storeProcurementsUseCase,

    ) {
    }

    public function store(ProcurementRequest $request)
    {
        $dto = StoreProcurementsDto::fromRequest($request);

        $this->storeProcurementsUseCase->execute($dto);

        return response()->json([

            'message' => 'Procurement created successfully',

        ], 200);

    }

}