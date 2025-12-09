<?php

namespace App\Core\Municipality\UseCases;

use App\Core\Municipality\Repositories\MunicipalityBannerRepository;
use App\Shared\FileUploader\CloudinaryFileUploadService;

class DeleteBannerUseCase
{

    public function __construct(

        protected MunicipalityBannerRepository $bannerRepo,

        protected CloudinaryFileUploadService $fileService,

    ) {
    }


    public function execute(string $bannerId)
    {

        $banner = $this->bannerRepo->findById($bannerId);

        if ($banner->public_id) {
            $this->fileService->delete($banner->public_id);
        }

        $this->bannerRepo->destroyBanner($bannerId);

    }

}