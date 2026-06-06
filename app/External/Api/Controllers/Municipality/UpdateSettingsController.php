<?php

namespace App\External\Api\Controllers\Municipality;

use App\Core\Municipality\Actions\UpdateMunicipalitySettingsAction;
use App\Core\Municipality\Dto\UpdateSettingsDto;
use App\External\Api\Request\Municipality\UpdateSettingsRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class UpdateSettingsController extends Controller
{
    public function __construct(
        private UpdateMunicipalitySettingsAction $updateSettings,
    ) {
    }

    public function __invoke(UpdateSettingsRequest $request): RedirectResponse
    {
        $this->updateSettings->execute(
            UpdateSettingsDto::fromRequest($request, app('municipal_id')),
        );

        return back()->with('success', 'Municipality settings updated.');
    }
}
