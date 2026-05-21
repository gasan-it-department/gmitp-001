<?php

namespace App\External\Api\Controllers\Cemetery\Decedents;

use App\Core\Cemetery\Dto\DecedentDto;
use App\Core\Cemetery\UseCase\RegisterDecedentUseCase;
use App\External\Api\Request\Cemetery\CreateDecedentRequest;
use App\Http\Controllers\Controller;

/**
 * Thin HTTP boundary for "create new decedent". Validates via CreateDecedentRequest,
 * hands a DTO to the use case, returns an Inertia redirect to the new profile page.
 *
 * No model access here — repository/use case own the data layer.
 */
class RegisterDecedentController extends Controller
{
    public function __construct(
        private RegisterDecedentUseCase $registerDecedent,
    ) {
    }

    public function __invoke(CreateDecedentRequest $request)
    {
        $municipality = app('current_municipality');

        $decedent = $this->registerDecedent->execute(
            DecedentDto::fromRequest($request)
        );

        return redirect()->route('cemetery.admin.decedents.profile.page', [
            'municipality' => $municipality->slug,
            'decedent_id' => $decedent->id,
        ])->with('success', 'Decedent registered successfully.');
    }
}
