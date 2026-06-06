<?php

namespace App\External\Api\Controllers\ActionCenter\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\LinkBeneficiaryAccountDto;
use App\Core\ActionCenter\UseCase\Beneficiary\LinkBeneficiaryToUserAction;
use App\External\Api\Request\ActionCenter\Beneficiary\LinkBeneficiaryAccountRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

/**
 * Admin "Link / change a beneficiary's portal account" endpoint.
 *
 * Route: POST /api/action-center/beneficiary/{beneficiaryId}/link-account
 * (tenant comes from the X-Municipality-Slug header — the API group has no
 * {municipality} path segment).
 *
 * Thin controller — no queries, no business rules. It only:
 *   • validates payload shape (LinkBeneficiaryAccountRequest)
 *   • collects tenant + authenticated-admin context
 *   • builds the DTO from primitives and hands off to the action
 *   • translates domain / authorization exceptions to flash-message redirects
 *
 * All rules (tenant guard, account resolution, one-account-one-beneficiary,
 * reason-required-on-change, audit) live in LinkBeneficiaryToUserAction.
 */
class LinkBeneficiaryAccountController extends Controller
{
    public function __construct(
        private readonly LinkBeneficiaryToUserAction $link,
    ) {
    }

    public function __invoke(
        string $beneficiaryId,
        LinkBeneficiaryAccountRequest $request,
    ): RedirectResponse {
        try {
            $dto = LinkBeneficiaryAccountDto::fromRequest(
                request: $request,
                beneficiaryId: $beneficiaryId,
                municipalId: app('municipal_id'),
                actingAdminId: Auth::id(),
            );

            $beneficiary = $this->link->execute($dto);

            return back()->with(
                'success',
                'Portal account linked to ' . (trim($beneficiary->full_name) ?: 'the beneficiary') . '. The change has been logged.',
            );
        } catch (\DomainException $e) {
            // No account found, no-op, missing reason on change, or duplicate
            // conflict — messages are already user-friendly.
            return back()->withErrors(['account' => $e->getMessage()]);
        } catch (AuthorizationException $e) {
            // Cross-tenant attempt.
            return back()->withErrors(['account' => $e->getMessage()]);
        }
    }
}
