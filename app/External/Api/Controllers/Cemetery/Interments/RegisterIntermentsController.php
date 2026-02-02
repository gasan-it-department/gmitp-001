<?php

namespace App\External\Api\Controllers\Cemetery\Interments;

use App\Core\Cemetery\Interments\Dto\AddIntermentsDto;
use App\Core\Cemetery\Interments\UseCase\AddIntermentUseCase;
use App\External\Api\Request\Cemetery\IntermentRequest;
use App\Http\Controllers\Controller;

class RegisterIntermentsController extends Controller
{

    public function __construct(

        private AddIntermentUseCase $addIntermentUseCase

    ) {
    }

    public function __invoke(IntermentRequest $request)
    {

        $dto = AddIntermentsDto::fromRequest($request);


        $interment = $this->addIntermentUseCase->execute($dto);

        return redirect()->route('landing');


    }

}