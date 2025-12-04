<?php

namespace App\External\Api\Controllers\Municipality;

use App\Core\Municipality\Dto\SetMunicipalitySettingDto;
use App\Core\Municipality\UseCases\SetMunicipalitySettingUseCase;
use Illuminate\Http\Request;

class MunicipalitySettingsController
{

    public function __construct(

        private SetMunicipalitySettingUseCase $setMunicipalitySettingUseCase,

    ) {
    }

    public function store(Request $request)
    {

        $userId = auth()->id();

        $municipalId = app('municipal_id');

        $homeBanners = $request->hasFile('banner') ? $request->file('banner') : [];

        dd($homeBanners);

        $dto = new SetMunicipalitySettingDto(

            municipalId: $municipalId,

            userId: $userId,

            homeBanners: $homeBanners

        );

        $this->setMunicipalitySettingUseCase->execute($dto);


    }

}