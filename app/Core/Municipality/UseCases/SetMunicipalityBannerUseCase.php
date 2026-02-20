<?php

namespace App\Core\Municipality\UseCases;

use App\Core\Municipality\Dto\SetMunicipalityBannerDto;
use App\Core\Municipality\Repositories\MunicipalityBannerRepository;
use App\Shared\FileUploader\CloudinaryFileUploadService;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Exception;

class SetMunicipalityBannerUseCase
{

    private const MAX_BANNERS = 10;

    public function __construct(

        protected MunicipalityBannerRepository $municipalityBannerRepo,

        protected CloudinaryFileUploadService $fileUplaod,

        protected IdGeneratorInterface $idGenerator,

    ) {
    }

    public function execute(SetMunicipalityBannerDto $dto)
    {
        $currentCount = $this->municipalityBannerRepo->countBanner($dto->municipalId);

        if ($currentCount >= self::MAX_BANNERS) {

            throw new Exception("Maximum of " . self::MAX_BANNERS . " banners allowed per municipality.");

        }

        if ($dto->homeBanners) {

            $folder = $this->fileUplaod->getFolderPath($dto->municipalId, 'municipal-settings');

            $uploadResults = $this->fileUplaod->uploadFiles(
                $dto->homeBanners,
                $folder,
                null,
                false,
            );

            $bannerId = $this->idGenerator->generate();

            $this->municipalityBannerRepo->saveBanner($uploadResults, $bannerId, $dto);

        }

    }

}