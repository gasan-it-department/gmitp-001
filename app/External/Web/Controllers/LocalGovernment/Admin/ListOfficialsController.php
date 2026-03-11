<?php

namespace App\External\Web\Controllers\LocalGovernment\Admin;

use App\Core\Government\Dto\OfficialQueryDto;
use App\Core\Government\UseCase\ListOfficialUseCase;
use App\External\Api\Resources\Government\OfficialResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ListOfficialsController extends Controller
{

    public function __construct(

        private ListOfficialUseCase $ListOfficialUseCase

    ) {
    }

    public function __invoke(Request $request)
    {

        $filters = OfficialQueryDto::fromRequest($request);

        $officials = $this->ListOfficialUseCase->execute(app('municipal_id'), $filters);

        return Inertia::render('LocalGovernment/Admin/PublicOfficials/List/OfficialsList', [

            'officials' => OfficialResource::collection($officials),

            'filters' => $request->only(['search']),

        ]);

    }

}