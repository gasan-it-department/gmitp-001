<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Interments;

use App\Core\Cemetery\Actions\GetAvailablePlotsAction;
use App\Core\Cemetery\Actions\Interments\GetMovableIntermentAction;
use App\Core\Cemetery\Actions\Sites\ListCemeterySitesAction;
use App\External\Api\Resources\Cemetery\Interments\IntermentMoveResource;
use App\External\Api\Resources\Cemetery\PlotListResource;
use App\External\Api\Resources\Cemetery\Sites\CemeterySiteResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class MoveIntermentController extends Controller
{
    public function __construct(
        private GetMovableIntermentAction $getMovableInterment,
        private ListCemeterySitesAction $listCemeterySites,
        private GetAvailablePlotsAction $getAvailablePlots,
    ) {}

    public function __invoke(string $municipality, string $interment_id): Response
    {
        $municipalId = app('municipal_id');

        return Inertia::render('Cemetery/Admin/Interments/Move/MoveInterment', [
            'municipality' => app('current_municipality'),
            'interment' => IntermentMoveResource::make(
                $this->getMovableInterment->execute($municipalId, $interment_id)
            )->resolve(),
            'sites' => CemeterySiteResource::collection(
                $this->listCemeterySites->execute($municipalId, activeOnly: true)
            )->resolve(),
            'available_plots' => PlotListResource::collection(
                $this->getAvailablePlots->execute($municipalId)
            )->resolve(),
        ]);
    }
}
