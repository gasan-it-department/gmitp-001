<?php

namespace App\Core\Municipality\Repositories;

use App\Core\Municipality\Dto\SetMunicipalityLogoDto;
use App\Core\Municipality\Dto\UpdateMunicipalitySettingsDto;
use App\Core\Municipality\Models\MunicipalitySettings;

class MunicipalitySettingRepository
{

    // FIX 1: Add '?' before array to allow nulls
    public function saveLogo(SetMunicipalityLogoDto $dto, string $municipalSettingsId, ?array $fileData)
    {
        $settings = MunicipalitySettings::firstOrNew([
            'municipal_id' => $dto->municipalId
        ]);

        if (!$settings->exists) {
            $settings->id = $municipalSettingsId;
        }

        $settings->user_id = $dto->userId;

        // FIX 2: Check if fileData exists, then save BOTH fields
        if ($fileData) {
            $settings->logo_public_id = $fileData['public_id'];
            $settings->logo_secure_url = $fileData['secure_url'];
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
            $settings->logo_secure_url = $fileData['secure_url'];

        }

        $settings->save();

        return $settings;

    }

}