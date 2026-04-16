<?php

namespace App\External\Web\Controllers\Procurement\Public;

use App\Core\Procurement\Dto\ProcurementFilterDto;
use App\Core\Procurement\UseCases\ListPublishedProcurementsUseCase;
use App\External\Api\Request\Procurement\GetProcurementRequest;
use App\External\Api\Resources\Procurement\ProcurementTransparencyResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class TransparencyPageController extends Controller
{

    public function __invoke(ListPublishedProcurementsUseCase $getProcurements, GetProcurementRequest $request)
    {

        $municipalId = app('municipal_id');

        $dto = ProcurementFilterDto::fromRequest($request->validated());

        $procurements = $getProcurements->execute($municipalId, $dto);

        return Inertia::render('PublicInformation/Client/TransparencyPage', [

            'procurements' => ProcurementTransparencyResource::collection($procurements)

        ]);

    }
}