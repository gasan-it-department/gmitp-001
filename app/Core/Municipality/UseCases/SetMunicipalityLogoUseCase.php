<?php

namespace App\Core\Municipality\UseCases;

use App\Core\Municipality\Dto\SetMunicipalityLogoDto;
use App\Core\Municipality\Repositories\MunicipalitySettingRepository;
use App\Shared\FileUploader\CloudinaryFileUploadService;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;

class SetMunicipalityLogoUseCase
{

    public function __construct(

        protected MunicipalitySettingRepository $municipalitySettingRepository,

        protected CloudinaryFileUploadService $cloudinaryFileUploadService,

        protected IdGeneratorInterface $idGenerator,

    ) {
    }

    public function execute(SetMunicipalityLogoDto $dto)
    {
        $municipalitSettingsId = $this->idGenerator->generate();

        $fileData = null;

        if ($dto->municipalLogo) {
            // RECOMMENDATION: Keep the 'muni-id-' prefix for clarity in dashboard
            $folder = $this->cloudinaryFileUploadService->getFolderPath($dto->municipalId, 'municipal-settings');

            $fileData = $this->cloudinaryFileUploadService->uploadFiles(
                $dto->municipalLogo,
                $folder,
                'logo',
                true
            );
        }

        $this->municipalitySettingRepository->saveLogo($dto, $municipalitSettingsId, $fileData);
    }
}