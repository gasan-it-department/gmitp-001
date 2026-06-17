<?php

namespace App\External\Documents\ActionCenter;

use App\Core\ActionCenter\UseCase\Beneficiary\ReplaceBeneficiaryIdentityDocumentAction;
use App\External\Api\Request\ActionCenter\Beneficiary\ReplaceBeneficiaryIdentityDocumentRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use InvalidArgumentException;

class ReplaceBeneficiaryIdentityDocumentController extends Controller
{
    public function __construct(
        private readonly ReplaceBeneficiaryIdentityDocumentAction $replaceIdentityDocument,
    ) {
    }

    public function __invoke(
        string $beneficiaryId,
        string $side,
        ReplaceBeneficiaryIdentityDocumentRequest $request,
    ): RedirectResponse {
        try {
            $this->replaceIdentityDocument->execute(
                beneficiaryId: $beneficiaryId,
                side: $side,
                document: $request->file('document'),
                municipalId: app('municipal_id'),
                actingAdminId: Auth::id(),
                reason: $request->string('reason')->trim()->toString() ?: null,
            );

            return back()->with('success', 'Identity document updated.');
        } catch (AuthorizationException|InvalidArgumentException $e) {
            return back()->withErrors(['document' => $e->getMessage()]);
        }
    }
}
