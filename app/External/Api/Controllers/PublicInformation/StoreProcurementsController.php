<?php

namespace App\External\Api\Controllers\PublicInformation;

use App\Core\PublicInformation\Dto\StoreProcurementsDto;
use App\Core\PublicInformation\UseCases\StoreProcurementsUseCase;
use App\External\Api\Request\PublicInformation\ProcurementRequest;

class StoreProcurementsController
{

    public function __construct(

        private StoreProcurementsUseCase $storeProcurementsUseCase,

    ) {
    }

    public function __invoke(ProcurementRequest $request)
    {

        $municipality = app('current_municipality');

        $slug = $municipality->slug;

        $dto = StoreProcurementsDto::fromRequest($request);

        $procurement = $this->storeProcurementsUseCase->execute($dto);

        return redirect()->route('procurement.admin.page', ['municipality' => $slug])->with('success', 'Procurement added successfully.');

    }

}