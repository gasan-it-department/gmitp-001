<?php

namespace App\External\Api\Controllers\Cemetery\Interments;

use App\Core\Cemetery\Actions\StoreIntermentAction;
use App\Core\Cemetery\Dto\IntermentDto;
use App\External\Api\Request\Cemetery\CreateIntermentRequest;
use App\Http\Controllers\Controller;

class StoreIntermentController extends Controller
{
    public function __construct(
        private StoreIntermentAction $storeInterment,
    ) {
    }

    public function __invoke(CreateIntermentRequest $request)
    {
        $municipality = app('current_municipality');

        $interment = $this->storeInterment->execute(
            IntermentDto::fromCreateRequest($request)
        );

        return redirect()->route('cemetery.admin.decedents.profile.page', [
            'municipality' => $municipality->slug,
            'decedent_id' => $interment->decedent_id,
        ])->with('success', 'Decedent successfully assigned to the selected plot.');
    }
}
