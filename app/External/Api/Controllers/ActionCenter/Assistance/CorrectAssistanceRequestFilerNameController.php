<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\CorrectAssistanceRequestFilerNameDto;
use App\Core\ActionCenter\UseCase\Assistance\CorrectAssistanceRequestFilerNameAction;
use App\External\Api\Request\ActionCenter\CorrectAssistanceRequestFilerNameRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;

class CorrectAssistanceRequestFilerNameController extends Controller
{
    public function __construct(
        private readonly CorrectAssistanceRequestFilerNameAction $correctFilerName,
    ) {}

    public function __invoke(
        string $assistanceRequestId,
        CorrectAssistanceRequestFilerNameRequest $request,
    ): RedirectResponse {
        try {
            $this->correctFilerName->execute(CorrectAssistanceRequestFilerNameDto::fromRequest(
                request: $request,
                assistanceRequestId: $assistanceRequestId,
                municipalId: app('municipal_id'),
            ));

            return back()->with(
                'success',
                'The verified beneficiary name was applied to the frozen request snapshot.',
            );
        } catch (AuthorizationException $exception) {
            throw $exception;
        } catch (\DomainException $exception) {
            return back()
                ->withInput()
                ->withErrors(['correct_filer_name' => $exception->getMessage()]);
        }
    }
}
