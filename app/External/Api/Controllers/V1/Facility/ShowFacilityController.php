<?php

namespace App\External\Api\Controllers\V1\Facility;

use App\Core\Facility\Actions\GetFacilityDetailsAction;
use App\External\Api\Resources\V1\Facility\FacilityDetailsResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ShowFacilityController extends Controller
{
    public function __construct(
        private GetFacilityDetailsAction $getFacilityDetails,
    ) {}

    public function __invoke(string $facility): JsonResponse
    {
        $model = $this->getFacilityDetails->execute(
            municipalId: app('municipal_id'),
            id: $facility,
            public: true,
        );

        return (new FacilityDetailsResource($model))->response()
            ->header('Cache-Control', 'no-store');
    }
}
