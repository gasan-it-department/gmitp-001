<?php

namespace App\External\Web\Controllers\PublicInformation\Client;

use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\External\Api\Resources\PublicInformation\ProcurementResource;
use App\Core\PublicInformation\UseCases\GetMunicipalityProcurementsUseCase;

class ProcuremenstPageController extends Controller
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