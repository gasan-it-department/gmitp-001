<?php

namespace App\External\Web\Controllers\Municipality;

use App\External\Api\Resources\Municipality\MunicipalBannerResource;
use App\Http\Controllers\Controller;
use inertia\Inertia;

class MunicipalityAdminController extends Controller
{

    public function index()
    {

        $municipality = app('current_municipality');

        $banners = $municipality->banners()
            ->get();

        return Inertia::render('Promotions/Admin/HomeBannerEditorPage', [

            'banners' => (MunicipalBannerResource::collection($banners))->resolve()

        ]);
    }

}