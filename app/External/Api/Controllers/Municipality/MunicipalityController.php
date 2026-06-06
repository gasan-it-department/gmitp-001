<?php

namespace App\External\Api\Controllers\Municipality;

use App\External\Api\Resources\Municipality\MunicipalityResource;
use App\Core\Municipality\Services\GetActiveMunicipality;

class MunicipalityController
{
    public function __construct(
        private GetActiveMunicipality $getActiveMunicipality,
    ) {
    }

    //fetch active municipalities for non-super admin users
    public function indexActiveMunicipalities()
    {
        try {
            $municipalities = $this->getActiveMunicipality->execute();

            return response()->json([
                'success' => true,
                'data' => MunicipalityResource::collection($municipalities),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'failed to fetch active municipalities',
            ], 200);
        }
    }
}
