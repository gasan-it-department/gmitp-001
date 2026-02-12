<?php

namespace App\External\Api\Controllers\Government\Official;

use App\Core\Government\Officials\Dto\AddOfficialDto;
use App\Core\Government\Officials\UseCase\AddOfficialUseCase;
use App\External\Api\Request\Government\OfficialRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StoreOfficialController extends Controller
{

    public function __construct(
        private AddOfficialUseCase $addOfficialUseCase
    ) {
    }

    public function __invoke(OfficialRequest $request)
    {

        $dto = AddOfficialDto::fromRequest($request);

        $official = $this->addOfficialUseCase->execute($dto);

    }

}