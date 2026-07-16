<?php

namespace App\External\Api\Controllers\ActionCenter\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\UpdateBeneficiaryProfileDto;
use App\Core\ActionCenter\UseCase\Beneficiary\UpdateBeneficiaryProfileAction;
use App\External\Api\Request\ActionCenter\Beneficiary\UpdateBeneficiaryProfileRequest;
use App\Http\Controllers\Controller;
use App\Shared\Phone\Services\PhoneFormatterService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

/**
 * Admin "correct a beneficiary's profile" endpoint.
 *
 * Route: PUT /api/action-center/beneficiary/{beneficiaryId} (tenant comes from
 * the X-Municipality-Slug header — the API group has no {municipality} segment).
 *
 * Thin controller — no queries, no business rules. It only:
 *   • validates payload shape (UpdateBeneficiaryProfileRequest)
 *   • collects tenant + authenticated-admin context
 *   • builds the DTO from primitives and hands off to the action
 *   • translates domain / authorization exceptions to flash-message redirects
 *
 * The tenant guard, the update, and the Head-row sync all live in
 * UpdateBeneficiaryProfileAction.
 */
class UpdateBeneficiaryProfileController extends Controller
{
    public function __construct(
        private readonly UpdateBeneficiaryProfileAction $updateProfile,
        private readonly PhoneFormatterService $phoneFormatter,
    ) {
    }

    public function __invoke(
        string $beneficiaryId,
        UpdateBeneficiaryProfileRequest $request,
    ): RedirectResponse {
        try {
            $dto = UpdateBeneficiaryProfileDto::fromRequest(
                request: $request,
                beneficiaryId: $beneficiaryId,
                municipalId: app('municipal_id'),
                actingAdminId: Auth::id(),
                phoneFormatter: $this->phoneFormatter,
            );

            $beneficiary = $this->updateProfile->execute($dto);

            return back()->with(
                'success',
                'Updated the profile of ' . (trim($beneficiary->full_name) ?: 'the beneficiary') . '. The change has been logged.',
            );
        } catch (\DomainException $e) {
            return back()->withInput()->withErrors(['profile' => $e->getMessage()]);
        } catch (AuthorizationException $e) {
            // Cross-tenant attempt.
            return back()->withErrors(['profile' => $e->getMessage()]);
        }
    }
}
