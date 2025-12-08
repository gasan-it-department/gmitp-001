<?php

namespace App\Core\Municipality\UseCases;

use App\Core\Municipality\Repositories\MunicipalityBannerRepository;

class DeleteBannerUseCase
{

    public function __construct(

        protected MunicipalityBannerRepository $bannerRepo,

    ) {
    }


    public function execute(string $bannerId)
    {

        $this->bannerRepo->destroyBanner($bannerId);

    }

}