<?php

namespace App\External\Api\Controllers\Government\OfficialTerms;

use App\Core\Government\Dto\AppointOfficialDto;
use App\Core\Government\UseCase\AppointOfficialUseCase;
use App\External\Api\Request\Government\AppointOfficialRequest;

class AppointOfficialController
{

    public function __construct(

        private AppointOfficialUseCase $appointOfficialUseCase

    ) {
    }

    public function __invoke(AppointOfficialRequest $request)
    {

        $dto = AppointOfficialDto::fromRequest($request);

        $this->appointOfficialUseCase->execute($dto);

        return redirect()->back()->with('success', 'Official successfully appointed.');

    }


}