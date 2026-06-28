<?php

namespace App\External\Api\Controllers\Cemetery\Plots;

use App\Core\Cemetery\Actions\Plots\GenerateApartmentNichesAction;
use App\Core\Cemetery\Dto\Plots\GenerateApartmentNichesDto;
use App\External\Api\Request\Cemetery\Plots\GenerateApartmentNichesRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class GenerateApartmentNichesController extends Controller
{
    public function __construct(
        private GenerateApartmentNichesAction $generateApartmentNiches,
    ) {}

    public function __invoke(GenerateApartmentNichesRequest $request, string $cemetery_site_id, string $block_id): RedirectResponse
    {
        $municipality = app('current_municipality');
        $apartment = $this->generateApartmentNiches->execute(
            GenerateApartmentNichesDto::fromRequest($request->validated(), $cemetery_site_id, $block_id)
        );

        return redirect()->route('cemetery.admin.sites.workspace.page', [
            'municipality' => $municipality->slug,
            'cemetery_site_id' => $cemetery_site_id,
        ])->with('success', $apartment->capacity.' apartment niche slots generated successfully.');
    }
}
