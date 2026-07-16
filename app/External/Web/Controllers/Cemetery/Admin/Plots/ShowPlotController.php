<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Plots;

use App\Core\Cemetery\Actions\Plots\GetPlotProfileAction;
use App\Core\Cemetery\Actions\Sites\GetCemeterySiteAction;
use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Enums\PlotTypes;
use App\External\Api\Resources\Cemetery\Plots\PlotProfileResource;
use App\External\Api\Resources\Cemetery\Sites\CemeterySiteResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ShowPlotController extends Controller
{
    public function __construct(
        private GetCemeterySiteAction $getCemeterySite,
        private GetPlotProfileAction $getPlotProfile,
    ) {}

    public function __invoke(string $municipality, string $cemetery_site_id, string $plot_id): Response
    {
        $municipalId = app('municipal_id');
        $site = $this->getCemeterySite->execute($municipalId, $cemetery_site_id);
        $plot = $this->getPlotProfile->execute($municipalId, $site->id, $plot_id);

        return Inertia::render('Cemetery/Admin/Plots/Profile/PlotProfile', [
            'municipality' => app('current_municipality'),
            'site' => CemeterySiteResource::make($site)->resolve(),
            'plot' => PlotProfileResource::make($plot)->resolve(),
            'type_options' => collect(PlotTypes::toOptions())
                ->reject(fn (array $option) => $option['value'] === PlotTypes::APARTMENT_NICHE->value)
                ->values()
                ->all(),
            'status_options' => collect(PlotStatus::toOptions())
                ->whereIn('value', [PlotStatus::AVAILABLE->value, PlotStatus::MAINTENANCE->value])
                ->values()
                ->all(),
            'occupancy_mode_options' => [
                ['value' => PlotOccupancyMode::SINGLE->value, 'label' => PlotOccupancyMode::SINGLE->label()],
                ['value' => PlotOccupancyMode::SHARED->value, 'label' => PlotOccupancyMode::SHARED->label()],
            ],
        ]);
    }
}
