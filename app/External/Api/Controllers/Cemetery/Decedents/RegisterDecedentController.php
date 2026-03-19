<?php

namespace App\External\Api\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Dto\DecedentDto;
use App\Core\Cemetery\UseCase\RegisterDecedentUseCase;
use App\External\Api\Request\Cemetery\DecedentRequest;
use App\Http\Controllers\Controller;

class RegisterDecedentController extends Controller
{

    public function __construct(
        private RegisterDecedentUseCase $decedentUseCase,
    ) {
    }
    public function __invoke(DecedentRequest $request)
    {
        $dto = DecedentDto::fromRequest($request);

        $this->decedentUseCase->execute($dto);

        return redirect()->route('ceme')
            ->with('success', 'Decedent registered successfully.');
    }
}