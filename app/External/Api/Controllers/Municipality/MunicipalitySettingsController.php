<?php

namespace App\External\Api\Controllers\Municipality;

use App\Core\Municipality\UseCases\DeleteBannerUseCase;
use App\Core\Municipality\UseCases\SetMunicipalitySettingsUseCase;
use Illuminate\Http\Request;
use App\Core\Municipality\Dto\SetMunicipalityBannerDto;
use App\Core\Municipality\Dto\SetMunicipalitySettingDto;
use App\Core\Municipality\UseCases\SetMunicipalityBannerUseCase;

class MunicipalitySettingsController
{

    public function __construct(

        private SetMunicipalityBannerUseCase $setMunicipalityBannerUseCase,

        private SetMunicipalitySettingsUseCase $setMunicipalitySettingsUseCase,

        private DeleteBannerUseCase $deleteBannerUseCase,

    ) {
    }

    public function store(Request $request)
    {

        $userId = auth()->id();

        $municipalId = app('municipal_id');

        $municipalLogo = $request->hasFile('logo') ? $request->file('logo') : [];

        $dto = new SetMunicipalitySettingDto(

            municipalId: $municipalId,

            userId: $userId,

            municiplaLogo: $municipalLogo

        );

        $this->setMunicipalitySettingsUseCase->execute($dto);

        return response()->json([

            'success' => true

        ], 200);

    }

    public function storeBanner(Request $request)
    {


        $userId = auth()->id();

        $municipalId = app('municipal_id');

        $homeBanners = $request->hasFile('banner') ? $request->file('banner') : [];

        $dto = new SetMunicipalityBannerDto(

            municipalId: $municipalId,

            userId: $userId,

            homeBanners: $homeBanners

        );

        $this->setMunicipalityBannerUseCase->execute($dto);

        return response()->json([

            'success' => true

        ], 200);

    }

    public function destroyBanner(Request $request)
    {

        $this->deleteBannerUseCase->execute();

    }

}