<?php

namespace App\External\Web\Controllers\PublicInformation\Admin;

use inertia\Inertia;
use App\Http\Controllers\Controller;
use App\External\Api\Resources\PublicInformation\ProcurementResource;
use App\Core\PublicInformation\UseCases\GetMunicipalityProcurementsUseCase;

class ProcurementsPageController extends Controller
{
    public function index(GetMunicipalityProcurementsUseCase $getProcurements)
    {
        $municipalId = app('municipal_id');

        $procurements = $getProcurements->execute($municipalId);

        return Inertia::render('PublicInformation/Admin/AwardsPage', [
            'procurements' => ProcurementResource::collection($procurements)
        ]);

    }

    public function addEditShow()
    {

        return Inertia::render('PublicInformation/Admin/AddEditProcurement', [
            'data' => 'hollow'
        ]);

    }
}