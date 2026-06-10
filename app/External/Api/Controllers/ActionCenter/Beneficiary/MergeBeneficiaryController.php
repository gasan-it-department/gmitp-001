<?php

namespace App\External\Api\Controllers\ActionCenter\Beneficiary;

use App\Core\ActionCenter\UseCase\Beneficiary\MergeBeneficiaryAction;
use App\External\Api\Request\ActionCenter\Beneficiary\MergeBeneficiaryRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

/**
 * Admin "mark this record as a duplicate and merge it into the canonical"
 * endpoint (non-destructive duplicate reconciliation).
 *
 * Route: POST /api/action-center/beneficiary/{beneficiaryId}/merge
 * `{beneficiaryId}` = the DUPLICATE being marked. Tenant comes from the
 * X-Municipality-Slug header (the API group has no {municipality} path segment).
 *
 * Thin controller — every guard (tenant, self/already-merged/canonical-is-dupe),
 * the account deactivation, the canonical flag, and the audit all live in
 * MergeBeneficiaryAction. Domain / authorization failures become flash errors.
 */
class MergeBeneficiaryController extends Controller
{
    public function __construct(
        private readonly MergeBeneficiaryAction $merge,
    ) {
    }

    public function __invoke(string $beneficiaryId, MergeBeneficiaryRequest $request): RedirectResponse
    {
        try {
            $canonical = $this->merge->execute(
                duplicateId: $beneficiaryId,
                canonicalBeneficiaryNumber: $request->string('canonical_beneficiary_number')->toString(),
                municipalId: app('municipal_id'),
                actingAdminId: Auth::id(),
                wasImproperClaim: $request->boolean('was_improper_claim'),
                notes: $request->input('notes'),
            );

            return back()->with(
                'success',
                'Record merged into ' . ($canonical->beneficiary_number ?? trim($canonical->full_name) ?: 'the canonical beneficiary')
                    . '. The duplicate is now linked and its account has been deactivated.',
            );
        } catch (\DomainException $e) {
            return back()->withErrors(['merge' => $e->getMessage()]);
        } catch (AuthorizationException $e) {
            return back()->withErrors(['merge' => $e->getMessage()]);
        }
    }
}
