<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Plots;

use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Enums\PlotTypes;
use App\Core\Cemetery\Repositories\SectionsRepository;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

/**
 * Renders the "create plot" form. The actual POST is handled by the API
 * StorePlotController; this controller only delivers the page + dropdown
 * options.
 */
class CreatePlotController extends Controller
{
    public function __construct(
        private SectionsRepository $sectionsRepo,
    ) {
    }

    public function __invoke()
    {
        $municipalId = app('municipal_id');

        return Inertia::render('Cemetery/Admin/Plots/Create/CreatePlot', [
            'municipality' => app('current_municipality'),
            'sections' => $this->sectionsRepo->listByMunicipality($municipalId)
                ->map(fn ($section) => ['id' => $section->id, 'name' => $section->name])
                ->values(),
            'type_options' => PlotTypes::toOptions(),
            'status_options' => PlotStatus::toOptions(),
        ]);
    }
}
