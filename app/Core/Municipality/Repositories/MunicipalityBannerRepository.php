<?php

namespace App\Core\Municipality\Repositories;

use App\Core\Municipality\Models\MunicipalityBanner;
use App\Core\Municipality\Dto\SetMunicipalityBannerDto;

class MunicipalityBannerRepository
{
    public function saveBanner(array $fileData, string $bannerId, SetMunicipalityBannerDto $dto)
    {

        return MunicipalityBanner::create([

            'id' => $bannerId,

            'municipal_id' => $dto->municipalId,

            'user_id' => $dto->userId,

            'public_id' => $fileData['public_id'],

        ]);

    }

    public function countBanner(string $municipalId)
    {

        return MunicipalityBanner::where('municipal_id', $municipalId)->count();

    }

    public function findById(string $bannerId)
    {

        return MunicipalityBanner::findOrFail('id', $bannerId);

    }

    public function destroyBanner(string $bannerId)
    {

        $banner = MunicipalityBanner::findOrFail($bannerId);

        $banner->delete();

    }

}