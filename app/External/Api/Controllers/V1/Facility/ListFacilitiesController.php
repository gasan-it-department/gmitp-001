<?php

namespace App\External\Api\Controllers\V1\Facility;

use App\Core\Facility\Actions\GetFacilitiesAction;
use App\External\Api\Request\V1\Facility\ListFacilitiesRequest;
use App\External\Api\Resources\V1\Facility\FacilityListResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ListFacilitiesController extends Controller
{
    public function __construct(
        private GetFacilitiesAction $listFacilities,
    ) {}

    public function __invoke(ListFacilitiesRequest $request): JsonResponse
    {
        $facilities = $this->listFacilities->execute(
            municipalId: app('municipal_id'),
            filters: $request->safe()->only(['search', 'type']),
            public: true,
            perPage: (int) ($request->validated('per_page') ?? 20),
        );

        return FacilityListResource::collection($facilities)->response()
            ->header('Cache-Control', 'no-store');
    }
}
