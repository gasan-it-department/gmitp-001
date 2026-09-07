<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\UseCase\Assistance\RefreshAssistanceHouseholdAssessmentAction;
use App\External\Api\Request\ActionCenter\RefreshAssistanceHouseholdAssessmentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\RedirectResponse;

class RefreshAssistanceHouseholdAssessmentController extends Controller
{
    public function __construct(
        private readonly RefreshAssistanceHouseholdAssessmentAction $refreshAssessment,
    ) {}

    public function __invoke(
        string $assistanceRequestId,
        RefreshAssistanceHouseholdAssessmentRequest $request,
    ): RedirectResponse
    {
        try {
            $actor = $request->user();
            $this->refreshAssessment->execute(
                assistanceRequestId: $assistanceRequestId,
                municipalId: app('municipal_id'),
                actingUserId: (string) $actor->id,
                canProcessRequests: $actor->can('action_center.requests.process'),
                canCorrectRequests: $actor->can('action_center.requests.correct'),
                correctionReason: $request->input('correction_reason'),
                expectedFingerprint: $request->string('assessment_fingerprint')->toString(),
            );

            return back()->with(
                'success',
                'The current household was synchronized for this assistance request.',
            );
        } catch (ModelNotFoundException) {
            return back()->withErrors([
                'household_assessment' => 'The assistance request was not found in your municipality.',
            ]);
        } catch (AuthorizationException $exception) {
            throw $exception;
        } catch (\DomainException $exception) {
            return back()->withErrors([
                'household_assessment' => $exception->getMessage(),
            ]);
        }
    }
}
