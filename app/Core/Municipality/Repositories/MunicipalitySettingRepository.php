<?php

namespace App\Core\Municipality\Repositories;

use App\Core\Municipality\Models\MunicipalityBanner;
use App\Core\Municipality\Models\MunicipalitySettings;
use App\Core\Municipality\Dto\SetMunicipalityBannerDto;
use App\Core\Municipality\Dto\SetMunicipalitySettingDto;

class MunicipalitySettingRepository
{

    public function save(SetMunicipalitySettingDto $dto, string $municipalSettingsId, array $fileData)
    {

        return MunicipalitySettings::create([

            'id' => $municipalSettingsId,

            'municipal_id' => $dto->municipalId,

            'user_id' => $dto->userId,

            'logo_public_id' => $fileData['public_id'],

        ]);


    }

    public function saveBanner(array $fileData, string $bannerId, SetMunicipalityBannerDto $dto)
    {

        return MunicipalityBanner::create([

            'id' => $bannerId,

            'municipal_id' => $dto->municipalId,

            'user_id' => $dto->userId,

            'public_id' => $fileData['public_id'],

        ]);

    }

    public function updateMunicipalSettings()
    {

    }

}