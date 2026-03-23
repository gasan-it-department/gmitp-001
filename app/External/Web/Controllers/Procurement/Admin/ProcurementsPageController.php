<?php

namespace App\External\Web\Controllers\Procurement\Admin;

use App\Core\Procurement\UseCases\GetMunicipalityProcurementsUseCase;
use App\External\Api\Resources\Procurement\ProcurementListResource;
use App\Http\Controllers\Controller;
use inertia\Inertia;

class ProcurementsPageController extends Controller
{
    public function index(GetMunicipalityProcurementsUseCase $getProcurements)
    {
        $municipalId = app('municipal_id');

        $procurements = $getProcurements->execute($municipalId);

        return Inertia::render('PublicInformation/Admin/Procurement/List/ProcurementList', [
            'procurements' => ProcurementListResource::collection($procurements)
        ]);

    }

    public function addEditShow()
    {

        return Inertia::render('PublicInformation/Admin/AddEditProcurement', [
            'data' => 'hollow'
        ]);

    }

    public function create()
    {

        return Inertia::render('PublicInformation/Admin/Procurement/Create/Create');

    }
}