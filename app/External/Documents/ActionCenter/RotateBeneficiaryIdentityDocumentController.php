<?php

namespace App\External\Documents\ActionCenter;

use App\Core\ActionCenter\UseCase\Beneficiary\RotateBeneficiaryIdentityDocumentAction;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use InvalidArgumentException;

class RotateBeneficiaryIdentityDocumentController extends Controller
{
    public function __construct(
        private readonly RotateBeneficiaryIdentityDocumentAction $rotateIdentityDocument,
    ) {
    }

    public function __invoke(
        string $beneficiaryId,
        string $side,
        string $direction,
    ): RedirectResponse {
        try {
            $this->rotateIdentityDocument->execute(
                beneficiaryId: $beneficiaryId,
                side: $side,
                direction: $direction,
                municipalId: app('municipal_id'),
                actingAdminId: Auth::id(),
            );

            return back()->with('success', 'Identity document orientation updated.');
        } catch (AuthorizationException | InvalidArgumentException | \DomainException $exception) {
            return back()->withErrors(['identity_document' => $exception->getMessage()]);
        }
    }
}
