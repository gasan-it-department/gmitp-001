<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\CorrectApprovedAssistanceAmountDto;
use App\Core\ActionCenter\UseCase\Assistance\CorrectApprovedAssistanceAmountAction;
use App\External\Api\Request\ActionCenter\CorrectApprovedAssistanceAmountRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class CorrectApprovedAssistanceAmountController extends Controller
{
    public function __construct(
        private readonly CorrectApprovedAssistanceAmountAction $correctAmount,
    ) {}

    public function __invoke(
        string $assistanceRequestId,
        CorrectApprovedAssistanceAmountRequest $request,
    ): RedirectResponse {
        try {
            $this->correctAmount->execute(CorrectApprovedAssistanceAmountDto::fromRequest(
                request: $request,
                assistanceRequestId: $assistanceRequestId,
                municipalId: app('municipal_id'),
                correctedByUserId: $request->user()->id,
            ));

            return back()->with(
                'success',
                'The approved amount was corrected. Regenerate affected financial and release documents before printing.',
            );
        } catch (\DomainException $exception) {
            return back()
                ->withInput()
                ->withErrors(['correct_approved_amount' => $exception->getMessage()]);
        }
    }
}
