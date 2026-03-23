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
        $municipality = app('current_municipality');

        $dto = DecedentDto::fromRequest($request);

        $decedent = $this->decedentUseCase->execute($dto);

        return redirect()->route('cemetery.admin.decedents.profile.page', [
            'municipality' => $municipality->slug,
            'decedent_id' => $decedent->id,

        ])->with('success', 'Decedent registered successfully.');
    }
}