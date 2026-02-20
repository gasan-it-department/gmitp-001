<?php

namespace App\Core\Municipality\Dto;

use Illuminate\Http\UploadedFile;

class SetMunicipalityLogoDto
{

    public function __construct(

        public string $municipalId,

        public string $userId,

        public ?UploadedFile $municipalLogo = null,

        // public ?string $settingsId = null,

    ) {
    }

}