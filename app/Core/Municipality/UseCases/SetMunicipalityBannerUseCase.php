<?php

namespace App\Core\Municipality\UseCases;

use App\Core\Municipality\Dto\SetMunicipalityBannerDto;
use App\Shared\FileUploader\CloudinaryFileUploadService;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use App\Core\Municipality\Repositories\MunicipalitySettingRepository;

class SetMunicipalityBannerUseCase
{

    public function __construct(

        protected MunicipalitySettingRepository $municipalitySettingsRepo,

        protected CloudinaryFileUploadService $fileUplaod,

        protected IdGeneratorInterface $idGenerator,

    ) {
    }

    public function execute(SetMunicipalityBannerDto $dto)
    {

        if ($dto->homeBanners) {

            $uploadResults = $this->fileUplaod->uploadFiles(
                $dto->homeBanners,
                'municipal_banners'
            );
            $bannerId = $this->idGenerator->generate();

            $this->municipalitySettingsRepo->saveBanner($uploadResults, $bannerId, $dto);

        }

    }

}