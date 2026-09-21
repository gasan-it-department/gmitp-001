<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\SaveAssistanceDisbursementDto;
use App\Core\ActionCenter\UseCase\Assistance\SaveAssistanceDisbursementAction;
use App\External\Api\Request\ActionCenter\SaveAssistanceDisbursementRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;

class SaveAssistanceDisbursementController extends Controller
{
    public function __construct(private readonly SaveAssistanceDisbursementAction $save) {}

    public function __invoke(SaveAssistanceDisbursementRequest $request, string $assistanceRequestId): RedirectResponse
    {
        try {
            $this->save->execute(SaveAssistanceDisbursementDto::fromRequest(
                $request,
                $assistanceRequestId,
                app('municipal_id'),
                (string) $request->user()->id,
            ));

            return back()->with('success', 'Disbursement draft saved.');
        } catch (\DomainException|AuthorizationException $exception) {
            return back()->withErrors(['disbursement' => $exception->getMessage()]);
        }
    }
}
