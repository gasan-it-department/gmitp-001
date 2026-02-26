<?php

namespace App\External\Web\Controllers\LocalGovernment\Admin;

use App\Core\Government\UseCase\GetOfficialTermUseCase;
use App\Core\Government\UseCase\GetPositionsUseCase;
use App\Core\Government\UseCase\GetTermDetailsUseCase;
use App\External\Api\Resources\Government\OfficialTermResource;
use App\External\Api\Resources\Government\PositionResource;
use App\External\Api\Resources\Government\TermResource;
use App\External\Api\Resources\Municipality\MunicipalityResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ShowTermController extends Controller
{

    public function __construct(

        private GetTermDetailsUseCase $getTermDetailsUseCase,

        private GetPositionsUseCase $getPositionsUseCase,

        private GetOfficialTermUseCase $getOfficialTermUseCase
    ) {
    }
    public function __invoke(string $municipalId, string $termId)
    {
        $municipality = app('current_municipality');

        $term = $this->getTermDetailsUseCase->execute($termId, app('municipal_id'));

        $positions = $this->getPositionsUseCase->execute();

        $appointment = $this->getOfficialTermUseCase->execute($termId);

        return Inertia::render('LocalGovernment/Admin/TermsOfService/Details/TermDetails', [

            'term' => new TermResource($term),

            'positions' => PositionResource::collection($positions),

            'appointment' => OfficialTermResource::collection($appointment),

            'municipality' => new MunicipalityResource($municipality)
        ]);
    }
}