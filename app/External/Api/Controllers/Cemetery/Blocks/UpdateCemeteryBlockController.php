<?php

namespace App\External\Api\Controllers\Cemetery\Blocks;

use App\Core\Cemetery\Actions\Blocks\UpdateCemeteryBlockAction;
use App\Core\Cemetery\Dto\Blocks\UpdateCemeteryBlockDto;
use App\External\Api\Request\Cemetery\Blocks\UpdateCemeteryBlockRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class UpdateCemeteryBlockController extends Controller
{
    public function __construct(
        private UpdateCemeteryBlockAction $updateBlock,
    ) {}

    public function __invoke(UpdateCemeteryBlockRequest $request, string $cemetery_site_id, string $section_id, string $block_id): RedirectResponse
    {
        $municipality = app('current_municipality');

        $this->updateBlock->execute(
            UpdateCemeteryBlockDto::fromRequest($request->validated(), $cemetery_site_id, $section_id, $block_id)
        );

        return redirect()->route('cemetery.admin.sites.workspace.page', [
            'municipality' => $municipality->slug,
            'cemetery_site_id' => $cemetery_site_id,
        ])->with('success', 'Block updated successfully.');
    }
}
