<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\ApplyAssistanceRequestProfileCorrectionsDto;
use App\Core\ActionCenter\UseCase\Assistance\ApplyAssistanceRequestProfileCorrectionsAction;
use App\External\Api\Request\ActionCenter\ApplyAssistanceRequestProfileCorrectionsRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;

class ApplyAssistanceRequestProfileCorrectionsController extends Controller
{
    public function __construct(
        private readonly ApplyAssistanceRequestProfileCorrectionsAction $applyCorrections,
    ) {}

    public function __invoke(
        string $assistanceRequestId,
        ApplyAssistanceRequestProfileCorrectionsRequest $request,
    ): RedirectResponse {
        try {
            $this->applyCorrections->execute(ApplyAssistanceRequestProfileCorrectionsDto::fromRequest(
                request: $request,
                assistanceRequestId: $assistanceRequestId,
                municipalId: app('municipal_id'),
            ));

            return back()->with(
                'success',
                'The selected verified profile corrections were applied to the request snapshot.',
            );
        } catch (AuthorizationException $exception) {
            throw $exception;
        } catch (\DomainException $exception) {
            return back()
                ->withInput()
                ->withErrors(['profile_correction' => $exception->getMessage()]);
        }
    }
}
