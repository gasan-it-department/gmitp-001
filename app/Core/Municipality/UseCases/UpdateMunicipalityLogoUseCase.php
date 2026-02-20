<?php
namespace App\Core\Municipality\UseCases;

use App\Core\Municipality\Dto\SetMunicipalityLogoDto;
use App\Core\Municipality\Repositories\MunicipalitySettingRepository;
use App\Shared\FileUploader\CloudinaryFileUploadService;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface; // Added

class UpdateMunicipalityLogoUseCase
{
    public function __construct(
        protected MunicipalitySettingRepository $municipalitySettingRepo,
        protected CloudinaryFileUploadService $cloudinaryFileUploadService,
        protected IdGeneratorInterface $idGenerator, // Added
    ) {
    }

    public function execute(SetMunicipalityLogoDto $dto)
    {
        // 1. Generate an ID just in case the row doesn't exist yet
        $municipalSettingsId = $this->idGenerator->generate();
        $fileData = null;

        // 2. Handle the file upload
        if ($dto->municipalLogo) {

            $folder = $this->cloudinaryFileUploadService->getFolderPath($dto->municipalId, 'municipal-settings');

            // Overwrite: true is the magic here. It safely deletes the old logo and puts the new one in.
            $fileData = $this->cloudinaryFileUploadService->uploadFiles(
                $dto->municipalLogo,
                $folder,
                'logo', // Fixed name
                true    // Overwrite existing
            );
        }

        // 3. Reuse the existing Repo method!
        $this->municipalitySettingRepo->saveLogo($dto, $municipalSettingsId, $fileData);
    }
}