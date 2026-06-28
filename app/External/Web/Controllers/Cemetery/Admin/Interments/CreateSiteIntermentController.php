<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Interments;

use App\Core\Cemetery\Actions\GetAvailablePlotsAction;
use App\Core\Cemetery\Actions\Interments\ListReadyUnassignedDecedentsAction;
use App\Core\Cemetery\Actions\Sites\GetCemeterySiteAction;
use App\Core\Cemetery\Enums\PlotTypes;
use App\External\Api\Resources\Cemetery\Interments\ReadyDecedentOptionResource;
use App\External\Api\Resources\Cemetery\PlotListResource;
use App\External\Api\Resources\Cemetery\Sites\CemeterySiteResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CreateSiteIntermentController extends Controller
{
    public function __construct(
        private GetCemeterySiteAction $getCemeterySite,
        private ListReadyUnassignedDecedentsAction $listReadyUnassignedDecedents,
        private GetAvailablePlotsAction $getAvailablePlots,
    ) {}

    public function __invoke(Request $request, string $municipality, string $cemetery_site_id): Response
    {
        $municipalId = app('municipal_id');
        $site = $this->getCemeterySite->execute($municipalId, $cemetery_site_id, activeOnly: true);

        return Inertia::render('Cemetery/Admin/Interments/Create/CreateSiteInterment', [
            'municipality' => app('current_municipality'),
            'site' => CemeterySiteResource::make($site)->resolve(),
            'decedents' => ReadyDecedentOptionResource::collection(
                $this->listReadyUnassignedDecedents->execute($municipalId)
            )->resolve(),
            'available_plots' => PlotListResource::collection(
                $this->getAvailablePlots->execute($municipalId, $site->id)
            )->resolve(),
            'type_options' => PlotTypes::toOptions(),
            'preselected_decedent_id' => $request->query('decedent_id'),
        ]);
    }
}
