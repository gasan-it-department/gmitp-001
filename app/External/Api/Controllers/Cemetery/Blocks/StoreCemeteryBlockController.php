<?php

namespace App\External\Api\Controllers\Cemetery\Blocks;

use App\Core\Cemetery\Actions\Blocks\StoreCemeteryBlockAction;
use App\Core\Cemetery\Dto\Blocks\CemeteryBlockDto;
use App\External\Api\Request\Cemetery\Blocks\StoreCemeteryBlockRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class StoreCemeteryBlockController extends Controller
{
    public function __construct(
        private StoreCemeteryBlockAction $storeBlock,
    ) {}

    public function __invoke(StoreCemeteryBlockRequest $request, string $cemetery_site_id, string $section_id): RedirectResponse
    {
        $municipality = app('current_municipality');

        $this->storeBlock->execute(
            CemeteryBlockDto::fromRequest($request->validated(), $cemetery_site_id, $section_id)
        );

        return redirect()->route('cemetery.admin.sites.workspace.page', [
            'municipality' => $municipality->slug,
            'cemetery_site_id' => $cemetery_site_id,
        ])->with('success', 'Block created successfully.');
    }
}
