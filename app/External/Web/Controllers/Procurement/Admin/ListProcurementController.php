<?php

namespace App\External\Web\Controllers\Procurement\Admin;

use App\Core\Procurement\UseCases\GetMunicipalityProcurementsUseCase;
use App\External\Api\Resources\Procurement\ProcurementListResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ListProcurementController extends Controller
{

    public function __invoke(GetMunicipalityProcurementsUseCase $getProcurements)
    {
        $municipalId = app('municipal_id');

        $procurements = $getProcurements->execute($municipalId);

        return Inertia::render('PublicInformation/Admin/Procurement/List/ProcurementList', [
            'procurements' => ProcurementListResource::collection($procurements)
        ]);

    }
}