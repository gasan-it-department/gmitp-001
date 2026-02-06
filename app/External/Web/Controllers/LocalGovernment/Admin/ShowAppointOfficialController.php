<?php

namespace App\External\Web\Controllers\LocalGovernment\Admin;

use App\Core\Government\UseCase\GetPositionsUseCase;
use App\Core\Government\UseCase\GetTermDetailsUseCase;
use App\External\Api\Resources\Government\TermResource;
use Inertia\Inertia;
use App\Http\Controllers\Controller;

class ShowAppointOfficialController extends Controller
{

    public function __construct(

        private GetTermDetailsUseCase $getTermDetailsUseCase,

        private GetPositionsUseCase $getPositionsUseCase,

    ) {
    }

    public function __invoke(string $municipalId, string $termId)
    {

        $municipality = app('current_municipality');

        $term = $this->getTermDetailsUseCase->execute($termId, app('municipal_id'));

        $positions = $this->getPositionsUseCase->execute();

        return Inertia::render('LocalGovernment/Admin/AppointOfficial/AppointOfficial', [

            'term' => new TermResource($term),

            'positions' => $positions,

            'municipality' => $municipality

        ]);

    }

}