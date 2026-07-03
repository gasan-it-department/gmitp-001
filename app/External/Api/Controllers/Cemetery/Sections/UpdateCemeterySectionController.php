<?php

namespace App\External\Api\Controllers\Cemetery\Sections;

use App\Core\Cemetery\Actions\Sections\UpdateCemeterySectionAction;
use App\Core\Cemetery\Dto\Sections\UpdateCemeterySectionDto;
use App\External\Api\Request\Cemetery\Sections\UpdateCemeterySectionRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class UpdateCemeterySectionController extends Controller
{
    public function __construct(
        private UpdateCemeterySectionAction $updateSection,
    ) {}

    public function __invoke(UpdateCemeterySectionRequest $request, string $cemetery_site_id, string $section_id): RedirectResponse
    {
        $municipality = app('current_municipality');

        $this->updateSection->execute(
            UpdateCemeterySectionDto::fromRequest($request->validated(), $cemetery_site_id, $section_id)
        );

        return redirect()->route('cemetery.admin.sites.workspace.page', [
            'municipality' => $municipality->slug,
            'cemetery_site_id' => $cemetery_site_id,
        ])->with('success', 'Section updated successfully.');
    }
}
