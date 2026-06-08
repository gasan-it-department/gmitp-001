<?php

namespace App\External\Web\Controllers\SuperAdmin;

use App\Core\Municipality\Services\GetAllMunicipalities;
use App\External\Api\Resources\Municipality\MunicipalityResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class SuperAdminController extends Controller
{
    public function showDashboard()
    {
        return Inertia::render('SuperAdmin/Dashboard/Dashboard');
    }

    public function showMunicipalityPage(GetAllMunicipalities $getAllMunicipalities)
    {
        $municipalities = $getAllMunicipalities->execute();

        return Inertia::render('SuperAdmin/Municipality/MunicipalityPage', [
            'municipalities' => MunicipalityResource::collection($municipalities),
        ]);
    }
}
