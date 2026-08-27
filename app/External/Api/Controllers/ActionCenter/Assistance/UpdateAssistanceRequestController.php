<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\UpdateAssistanceRequestDto;
use App\Core\ActionCenter\UseCase\Assistance\UpdateAssistanceRequestAction;
use App\External\Api\Request\ActionCenter\UpdateAssistanceRequestRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

/**
 * Admin "correct an in-flight assistance request" endpoint.
 *
 * Route: POST /api/action-center/assistance-request/{assistanceRequestId}/update
 * (POST + multipart for the document uploads; tenant via X-Municipality-Slug).
 *
 * Thin controller — the tenant guard, the editability gate, the description
 * write, the document replace, and the audit all live in
 * UpdateAssistanceRequestAction.
 */
class UpdateAssistanceRequestController extends Controller
{
    public function __construct(
        private readonly UpdateAssistanceRequestAction $updateRequest,
    ) {
    }

    public function __invoke(string $assistanceRequestId, UpdateAssistanceRequestRequest $request): RedirectResponse
    {
        try {
            $dto = UpdateAssistanceRequestDto::fromRequest(
                request: $request,
                assistanceRequestId: $assistanceRequestId,
                municipalId: app('municipal_id'),
                municipalCode: app('current_municipality')->municipal_code,
                actingAdminId: Auth::id(),
            );

            $this->updateRequest->execute($dto);

            return back()->with('success', 'Request details updated. The change has been logged.');
        } catch (\DomainException $e) {
            return back()->withInput()->withErrors(['request' => $e->getMessage()]);
        } catch (AuthorizationException $e) {
            return back()->withErrors(['request' => $e->getMessage()]);
        }
    }
}
