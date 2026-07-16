<?php

namespace App\External\Api\Controllers\Cemetery\Sites;

use App\Core\Cemetery\Actions\Sites\UpdateCemeterySiteAction;
use App\Core\Cemetery\Dto\Sites\UpdateCemeterySiteDto;
use App\External\Api\Request\Cemetery\Sites\UpdateCemeterySiteRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class UpdateCemeterySiteController extends Controller
{
    public function __construct(
        private UpdateCemeterySiteAction $updateSite,
    ) {}

    public function __invoke(UpdateCemeterySiteRequest $request, string $cemetery_site_id): RedirectResponse
    {
        $municipality = app('current_municipality');

        $this->updateSite->execute(
            UpdateCemeterySiteDto::fromRequest($request->validated(), $cemetery_site_id)
        );

        return redirect()->route('cemetery.admin.sites.workspace.page', [
            'municipality' => $municipality->slug,
            'cemetery_site_id' => $cemetery_site_id,
        ])->with('success', 'Cemetery Site updated successfully.');
    }
}
