<?php

namespace App\External\Api\Controllers\Cemetery\Interments;

use App\Core\Cemetery\Dto\IntermentDto;
use App\Core\Cemetery\UseCase\CreateIntermentUseCase;
use App\External\Api\Request\Cemetery\CreateIntermentRequest;
use App\Http\Controllers\Controller;

class StoreIntermentController extends Controller
{
    public function __construct(
        private CreateIntermentUseCase $createInterment,
    ) {
    }

    public function __invoke(CreateIntermentRequest $request)
    {
        $municipality = app('current_municipality');

        $interment = $this->createInterment->execute(
            IntermentDto::fromCreateRequest($request)
        );

        return redirect()->route('cemetery.admin.decedents.profile.page', [
            'municipality' => $municipality->slug,
            'decedent_id' => $interment->decedent_id,
        ])->with('success', 'Decedent successfully assigned to the selected plot.');
    }
}
