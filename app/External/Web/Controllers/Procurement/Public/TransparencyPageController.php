<?php

namespace App\External\Web\Controllers\Procurement\Public;

use App\Core\Procurement\UseCases\GetMunicipalityProcurementsUseCase;
use App\External\Api\Resources\PublicInformation\ProcurementResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class TransparencyPageController extends Controller
{

    public function index(GetMunicipalityProcurementsUseCase $getProcurements)
    {

        $municipalId = app('municipal_id');

        $procurements = $getProcurements->execute($municipalId);

        return Inertia::render('PublicInformation/Client/TransparencyPage', [

            'procurements' => ProcurementResource::collection($procurements)

        ]);

    }

    //add other function here for procurement

}