<?php

namespace App\External\Api\Controllers\Municipality;

use App\Core\Municipality\UseCases\DeleteBannerUseCase;
use App\Core\Municipality\UseCases\UpdateMunicipalitySettingsUseCase;
use Illuminate\Http\Request;
use App\Core\Municipality\Dto\SetMunicipalityBannerDto;
use App\Core\Municipality\UseCases\SetMunicipalityBannerUseCase;

class MunicipalitySettingsController
{

    public function __construct(

        private SetMunicipalityBannerUseCase $setMunicipalityBannerUseCase,

        private DeleteBannerUseCase $deleteBannerUseCase,

        private UpdateMunicipalitySettingsUseCase $updateMunicipalitySettingsUseCase

    ) {
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

    public function destroyBanner($id)
    {

        $this->deleteBannerUseCase->execute($id);

        return response()->json(['message' => 'Banner successfully deleted']);

    }

}