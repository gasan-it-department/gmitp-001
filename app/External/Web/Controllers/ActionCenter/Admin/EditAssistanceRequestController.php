<?php

namespace App\External\Web\Controllers\ActionCenter\Admin;

use App\Core\ActionCenter\UseCase\Assistance\GetAssistanceRequestProfileAction;
use App\External\Api\Resources\ActionCenter\AssistanceRequest\AssistanceRequestDetailsResource;
use App\External\Api\Resources\ActionCenter\RequiredDocumentResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin: render the "correct an assistance request" form (display only).
 *
 * Route: GET /{municipality}/action-center/admin/profile/assistance-request/{assistanceRequest}/edit
 *
 * Loads the request (tenant-guarded by GetAssistanceRequestProfileAction — a
 * request from another LGU 404s). If the request is no longer editable
 * (approved/released/rejected/cancelled) it redirects back to the detail page
 * with an error — the editability rule is enforced here AND in the action, so
 * hiding the button is never the only guard. The POST goes to the Api
 * UpdateAssistanceRequestController.
 */
class EditAssistanceRequestController extends Controller
{
    public function __construct(
        private readonly GetAssistanceRequestProfileAction $getAssistance,
    ) {
    }

    public function __invoke(string $municipality, string $assistanceRequestId): Response|RedirectResponse
    {
        $municipalId = app('municipal_id');

        $data = $this->getAssistance->execute($municipalId, $assistanceRequestId);
        $assistanceRequest = $data['request'];

        if (! $assistanceRequest->status->isEditable()) {
            return redirect()
                ->route('actionCenter.admin.show.assistance-request.profile', [
                    'municipality'      => $municipality,
                    'assistanceRequest' => $assistanceRequestId,
                ])
                ->withErrors([
                    'request' => 'This request can no longer be edited because it has already been '
                        . $assistanceRequest->status->label() . '.',
                ]);
        }

        return Inertia::render('ActionCenter/Admin/Assistance/Edit/EditAssistanceRequest', [
            'request' => new AssistanceRequestDetailsResource($assistanceRequest),
            'requiredDocuments' => RequiredDocumentResource::collection(
                $assistanceRequest->assistanceType->documents->sortBy(fn ($doc) => $doc->pivot->sort_order ?? 0)
            ),
            'submitUrl' => route('actionCenter.assistance.update', ['assistanceRequestId' => $assistanceRequestId]),
        ]);
    }
}
