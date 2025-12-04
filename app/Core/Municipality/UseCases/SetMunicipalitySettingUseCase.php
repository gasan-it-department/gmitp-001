<?php

namespace App\Core\Municipality\UseCases;

use App\Core\Municipality\Dto\SetMunicipalitySettingDto;
use App\Core\Municipality\Repositories\MunicipalitySettingRepository;
use App\Shared\FileUploader\CloudinaryFileUploadService;

class SetMunicipalitySettingUseCase
{

    public function __construct(

        protected MunicipalitySettingRepository $municipalitySettingsRepo,

        protected CloudinaryFileUploadService $fileUplaod,

    ) {
    }

    public function execute(SetMunicipalitySettingDto $dto)
    {

        //call the file uplaod service here

        $this->municipalitySettingsRepo->save();

    }

}