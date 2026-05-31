<?php

namespace App\External\Web\Controllers\Municipality\Admin;

use App\Core\Municipality\Actions\GetAdminHotlinesAction;
use App\Core\Municipality\Actions\GetMunicipalitySettingsAction;
use App\Core\Municipality\Enums\HotlineCategory;
use App\External\Api\Resources\Municipality\HotlineResource;
use App\External\Api\Resources\Municipality\MunicipalitySettingsResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class EditMunicipalitySettingsController extends Controller
{
    public function __construct(
        private GetMunicipalitySettingsAction $getSettings,
        private GetAdminHotlinesAction $getHotlines,
    ) {
    }

    public function __invoke(string $municipality): Response
    {
        $municipalId = app('municipal_id');

        $model    = $this->getSettings->execute($municipalId);
        $hotlines = $this->getHotlines->execute($municipalId);

        return Inertia::render('Municipality/Settings', [
            'settings'           => (new MunicipalitySettingsResource($model))->resolve(),
            'hotlines'           => HotlineResource::collection($hotlines)->resolve(),
            'hotline_categories' => HotlineCategory::toOptions(),
        ]);
    }
}
