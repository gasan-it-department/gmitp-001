<?php

namespace App\External\Api\Controllers\Government\Terms;

use App\Core\Government\Dto\TermDto;
use App\Core\Government\UseCase\CreateTermUseCase;
use App\External\Api\Request\Government\TermRequest;
use App\Http\Controllers\Controller;

class CreateTermController extends Controller
{

    public function __construct(
        private CreateTermUseCase $createTermUseCase,
    ) {
    }


    public function __invoke(TermRequest $request)
    {
        $dto = TermDto::fromRequest($request);

        $this->createTermUseCase->execute($dto);

        return redirect()->back()->with('success', 'Term created successfully.');

    }

}