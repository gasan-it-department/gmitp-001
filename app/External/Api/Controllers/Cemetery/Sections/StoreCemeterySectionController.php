<?php

namespace App\External\Api\Controllers\Cemetery\Sections;

use App\Core\Cemetery\Actions\Sections\StoreCemeterySectionAction;
use App\Core\Cemetery\Dto\Sections\CemeterySectionDto;
use App\External\Api\Request\Cemetery\Sections\StoreCemeterySectionRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class StoreCemeterySectionController extends Controller
{
    public function __construct(
        private StoreCemeterySectionAction $storeSection,
    ) {}

    public function __invoke(StoreCemeterySectionRequest $request, string $cemetery_site_id): RedirectResponse
    {
        $municipality = app('current_municipality');

        $this->storeSection->execute(
            CemeterySectionDto::fromRequest($request->validated(), $cemetery_site_id)
        );

        return redirect()->route('cemetery.admin.sites.workspace.page', [
            'municipality' => $municipality->slug,
            'cemetery_site_id' => $cemetery_site_id,
        ])->with('success', 'Section created successfully.');
    }
}
