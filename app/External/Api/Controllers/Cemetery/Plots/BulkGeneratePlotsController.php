<?php

namespace App\External\Api\Controllers\Cemetery\Plots;

use App\Core\Cemetery\Actions\Plots\BulkGeneratePlotsAction;
use App\Core\Cemetery\Dto\Plots\BulkGeneratePlotsDto;
use App\External\Api\Request\Cemetery\Plots\BulkGeneratePlotsRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class BulkGeneratePlotsController extends Controller
{
    public function __construct(
        private BulkGeneratePlotsAction $bulkGeneratePlots,
    ) {}

    public function __invoke(BulkGeneratePlotsRequest $request, string $cemetery_site_id, string $block_id): RedirectResponse
    {
        $municipality = app('current_municipality');
        $created = $this->bulkGeneratePlots->execute(
            BulkGeneratePlotsDto::fromRequest($request->validated(), $cemetery_site_id, $block_id)
        );

        return redirect()->route('cemetery.admin.sites.workspace.page', [
            'municipality' => $municipality->slug,
            'cemetery_site_id' => $cemetery_site_id,
        ])->with('success', count($created).' plots generated successfully.');
    }
}
