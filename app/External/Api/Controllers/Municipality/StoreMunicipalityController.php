<?php

namespace App\External\Api\Controllers\Municipality;

use App\Core\Municipality\Dto\AddMunicipalityDto;
use App\Core\Municipality\Services\AddMunicipalityService;
use App\External\Api\Request\Municipality\MunicipalityRequest;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class StoreMunicipalityController extends Controller
{
    public function __construct(
        private AddMunicipalityService $addMunicipalityService,

    ) {
    }

    public function __invoke(MunicipalityRequest $request)
    {
        $municipalityData = $request->validated();

        $psgcMunicipal = DB::table('psgc_municipalities')
            ->where('id', $municipalityData['psgc_municipal_id'])
            ->first();

        $dto = new AddMunicipalityDto(
            name: strtoupper($psgcMunicipal->name),
            psgcMunicipalId: $psgcMunicipal->id,
            code: $psgcMunicipal->psgc_code,
            zipCode: $municipalityData['zip_code'],
            isActive: $municipalityData['is_active'] ?? false,
        );


        $this->addMunicipalityService->execute($dto);

        return redirect()->back()->with('success', 'Municipality added successfully.');

    }
}