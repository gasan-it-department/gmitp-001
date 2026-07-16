<?php

namespace App\External\Api\Controllers\Cemetery\Plots;

use App\Core\Cemetery\Actions\Plots\AddApartmentNichesAction;
use App\Core\Cemetery\Dto\Plots\AddApartmentNichesDto;
use App\External\Api\Request\Cemetery\Plots\AddApartmentNichesRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class AddApartmentNichesController extends Controller
{
    public function __construct(
        private AddApartmentNichesAction $addApartmentNiches,
    ) {}

    public function __invoke(AddApartmentNichesRequest $request, string $cemetery_site_id, string $plot_id): RedirectResponse
    {
        $municipality = app('current_municipality');
        $dto = AddApartmentNichesDto::fromRequest($request->validated(), $cemetery_site_id, $plot_id);

        $this->addApartmentNiches->execute($dto);

        return redirect()->route('cemetery.admin.sites.plots.profile.page', [
            'municipality' => $municipality->slug,
            'cemetery_site_id' => $cemetery_site_id,
            'plot_id' => $plot_id,
        ])->with('success', $dto->totalSlots().' apartment niche slots added successfully.');
    }
}
