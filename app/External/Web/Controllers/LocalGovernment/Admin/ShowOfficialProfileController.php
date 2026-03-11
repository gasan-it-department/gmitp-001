<?php

namespace App\External\Web\Controllers\LocalGovernment\Admin;

use App\Core\Government\UseCase\GetOfficialProfileUseCase;
use App\External\Api\Resources\Government\OfficialResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ShowOfficialProfileController extends Controller
{

    public function __construct(
        private GetOfficialProfileUseCase $getOfficialProfileUseCase
    ) {
    }
    public function __invoke(string $municipalSlug, string $officialId)
    {

        $official = $this->getOfficialProfileUseCase->execute($officialId, app('municipal_id'));

        return Inertia::render('LocalGovernment/Admin/PublicOfficials/Profile/OfficialProfileDashboard', [
            'official' => new OfficialResource($official),
            'municipality' => app('current_municipality')
        ]);

    }



}