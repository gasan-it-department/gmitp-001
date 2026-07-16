<?php

namespace App\External\Web\Controllers\Cemetery\Admin\Plots;

use App\Core\Cemetery\Actions\ListBlocksAction;
use App\Core\Cemetery\Actions\Sites\GetCemeterySiteAction;
use App\Core\Cemetery\Enums\PlotTypes;
use App\External\Api\Resources\Cemetery\Sites\CemeterySiteResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Renders the "register new plot" form. Web layer — pure Inertia render. The
 * actual POST is handled by `Api\StorePlotController` which runs the
 * `BulkGenerateMultiCapacityPlotsAction`.
 *
 * The new spatial hierarchy is Section → Block → Plot, so this page hydrates
 * the BLOCK dropdown (each entry carries its section name for context). The
 * initial-status selector was removed: the Action chooses the status
 * deterministically (container = NULL, single / slot = AVAILABLE), so accepting
 * a status from the payload would just be a vector for inconsistency.
 */
class CreatePlotController extends Controller
{
    public function __construct(
        private ListBlocksAction $listBlocks,
        private GetCemeterySiteAction $getCemeterySite,
    ) {}

    public function __invoke(string $municipality, string $cemetery_site_id): Response
    {
        $municipalId = app('municipal_id');
        $site = $this->getCemeterySite->execute($municipalId, $cemetery_site_id, activeOnly: true);

        $blocks = $this->listBlocks->execute($municipalId, $site->id)
            ->map(fn ($block) => [
                'id' => $block->id,
                'name' => $block->name,
                'section' => $block->section ? [
                    'id' => $block->section->id,
                    'name' => $block->section->name,
                ] : null,
            ])
            ->values();

        $blocks = $this->listBlocks->execute($municipalId)
            ->map(fn ($block) => [
                'id' => $block->id,
                'name' => $block->name,
                'section' => $block->section ? [
                    'id' => $block->section->id,
                    'name' => $block->section->name,
                ] : null,
            ])
            ->values();

        return Inertia::render('Cemetery/Admin/Plots/Create/CreatePlot', [
            'municipality' => app('current_municipality'),
            'site' => CemeterySiteResource::make($site)->resolve(),
            'blocks' => $blocks,
            'type_options' => PlotTypes::toOptions(),
        ]);
    }
}
