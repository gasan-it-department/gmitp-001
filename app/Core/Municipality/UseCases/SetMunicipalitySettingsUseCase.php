<?php

namespace App\Core\Municipality\UseCases;

use App\Core\Municipality\Dto\SetMunicipalitySettingDto;
use App\Core\Municipality\Repositories\MunicipalitySettingRepository;
use App\Shared\FileUploader\CloudinaryFileUploadService;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;

class SetMunicipalitySettingsUseCase
{

    public function __construct(

        protected MunicipalitySettingRepository $municipalitySettingRepository,

        protected CloudinaryFileUploadService $cloudinaryFileUploadService,

        protected IdGeneratorInterface $idGenerator,

    ) {
    }

    public function execute(SetMunicipalitySettingDto $dto)
    {

        $municipalitSettingsId = $this->idGenerator->generate();


        $fileData = null;

        if ($dto->municiplaLogo) {

            $fileData = $this->cloudinaryFileUploadService->uploadFiles(
                $dto->municiplaLogo,
                'municipal_logo'
            );

        }

        $this->municipalitySettingRepository->save($dto, $municipalitSettingsId, $fileData);


    }

}