<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\UseCase\Assistance\RefreshAssistanceHouseholdAssessmentAction;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class RefreshAssistanceHouseholdAssessmentController extends Controller
{
    public function __construct(
        private readonly RefreshAssistanceHouseholdAssessmentAction $refreshAssessment,
    ) {}

    public function __invoke(string $assistanceRequestId): RedirectResponse
    {
        try {
            $this->refreshAssessment->execute(
                assistanceRequestId: $assistanceRequestId,
                municipalId: app('municipal_id'),
                actingUserId: (string) Auth::id(),
            );

            return back()->with(
                'success',
                'The current household was captured for this assistance interview.',
            );
        } catch (ModelNotFoundException) {
            return back()->withErrors([
                'household_assessment' => 'The assistance request was not found in your municipality.',
            ]);
        } catch (AuthorizationException|\DomainException $exception) {
            return back()->withErrors([
                'household_assessment' => $exception->getMessage(),
            ]);
        }
    }
}
