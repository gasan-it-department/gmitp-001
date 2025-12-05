<?php

namespace App\Core\Municipality\Dto;
use Illuminate\Http\UploadedFile;

class SetMunicipalitySettingDto
{

    public function __construct(

        public string $municipalId,

        public string $userId,

        public ?UploadedFile $municiplaLogo = null,

    ) {
    }

}