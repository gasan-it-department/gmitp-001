<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\CorrectMissingBurialDateOfDeathDto;
use App\Core\ActionCenter\UseCase\Assistance\CorrectMissingBurialDateOfDeathAction;
use App\External\Api\Request\ActionCenter\CorrectMissingBurialDateOfDeathRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;

/**
 * Admin endpoint for the one-time approved burial Date of Death repair.
 * Business rules remain in CorrectMissingBurialDateOfDeathAction.
 */
class CorrectMissingBurialDateOfDeathController extends Controller
{
    public function __construct(
        private readonly CorrectMissingBurialDateOfDeathAction $correctDateOfDeath,
    ) {
    }

    public function __invoke(
        string $assistanceRequestId,
        CorrectMissingBurialDateOfDeathRequest $request,
    ): RedirectResponse {
        try {
            $this->correctDateOfDeath->execute(CorrectMissingBurialDateOfDeathDto::fromRequest(
                request: $request,
                assistanceRequestId: $assistanceRequestId,
                municipalId: app('municipal_id'),
                municipalCode: app('current_municipality')->municipal_code,
                correctedByUserId: $request->user()->id,
            ));

            return back()->with(
                'success',
                'The missing Date of Death was added and recorded in the audit trail.',
            );
        } catch (\DomainException $e) {
            return back()
                ->withInput()
                ->withErrors(['correct_missing_date_of_death' => $e->getMessage()]);
        } catch (AuthorizationException $e) {
            return back()
                ->withInput()
                ->withErrors(['correct_missing_date_of_death' => $e->getMessage()]);
        }
    }
}
