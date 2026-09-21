<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\UseCase\Assistance\RecordAssistanceDisbursementManualContactAction;
use App\External\Api\Request\ActionCenter\RecordAssistanceDisbursementManualContactRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;

class RecordAssistanceDisbursementManualContactController extends Controller
{
    public function __construct(private readonly RecordAssistanceDisbursementManualContactAction $record) {}

    public function __invoke(
        RecordAssistanceDisbursementManualContactRequest $request,
        string $assistanceRequestId,
        string $disbursementId,
    ): RedirectResponse {
        try {
            $this->record->execute(
                $assistanceRequestId,
                $disbursementId,
                app('municipal_id'),
                (string) $request->user()->id,
                (string) $request->validated('channel'),
                trim((string) $request->validated('note')),
            );

            return back()->with('success', 'Manual claimant contact recorded.');
        } catch (\DomainException|AuthorizationException $exception) {
            return back()->withErrors(['disbursement_contact' => $exception->getMessage()]);
        }
    }
}
