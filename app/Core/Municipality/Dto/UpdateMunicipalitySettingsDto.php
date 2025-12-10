<?php

namespace App\Core\Municipality\Dto;

use Illuminate\Http\UploadedFile;

class UpdateMunicipalitySettingsDto
{

    public function __construct(

        public string $settingsId,

        public string $userId,

        public ?UploadedFile $logoImage = null

    ) {
    }

}