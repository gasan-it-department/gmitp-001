<?php

namespace App\Core\Municipality\Dto;

class SetMunicipalitySettingDto
{

    public function __construct(

        public string $municipalId,

        public string $userId,

        public ?array $homeBanners = null,

    ) {
    }

}