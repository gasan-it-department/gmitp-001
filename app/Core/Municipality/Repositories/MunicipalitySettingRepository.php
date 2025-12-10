<?php

namespace App\Core\Municipality\Repositories;

use App\Core\Municipality\Dto\UpdateMunicipalitySettingsDto;
use App\Core\Municipality\Models\MunicipalitySettings;
use App\Core\Municipality\Dto\SetMunicipalitySettingDto;

class MunicipalitySettingRepository
{

    public function save(SetMunicipalitySettingDto $dto, string $municipalSettingsId, array $fileData)
    {

        $settings = MunicipalitySettings::firstOrNew([

            'municipal_id' => $dto->municipalId

        ]);

        if (!$settings->exists) {

            $settings->id = $municipalSettingsId;

        }

        $settings->user_id = $dto->userId;

        if (!empty($fileData['public_id'])) {

            $settings->logo_public_id = $fileData['public_id'];

        }

        $settings->save();

        return $settings;

    }

    public function findById(string $settingsId)
    {

        return MunicipalitySettings::findOrFail($settingsId);

    }

    public function update(MunicipalitySettings $settings, UpdateMunicipalitySettingsDto $dto, array $fileData = null)
    {
        $settings->user_id = $dto->userId;

        if ($fileData) {

            $settings->logo_public_id = $fileData['public_id'];

        }

        $settings->save();

        return $settings;

    }

}