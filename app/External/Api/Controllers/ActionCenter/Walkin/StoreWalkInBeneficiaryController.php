<?php

namespace App\External\Api\Controllers\ActionCenter\Walkin;

use App\Core\ActionCenter\Dto\Beneficiary\CreateWalkInBeneficiaryDto;
use App\Core\ActionCenter\Exceptions\RegistrationIdentityCheckException;
use App\Core\ActionCenter\Exceptions\WalkInBeneficiaryIdentityDocumentStorageException;
use App\Core\ActionCenter\UseCase\Beneficiary\CreateWalkInBeneficiaryAction;
use App\External\Api\Request\ActionCenter\Walkin\StoreWalkInBeneficiaryRequest;
use App\Http\Controllers\Controller;
use App\Shared\Phone\Services\PhoneFormatterService;
use Illuminate\Http\RedirectResponse;

/**
 * Admin "encode a walk-in beneficiary" endpoint.
 *
 * Route: POST /api/action-center/walkin
 * (tenant via the X-Municipality-Slug header — the API group has no
 * {municipality} path segment).
 *
 * Thin controller — builds the DTO from validated primitives + context and
 * hands off to the action. Three outcomes:
 *   • Success            → redirect to the new beneficiary's profile page.
 *   • Stale identity check → redirect back for another registry check.
 *   • Other domain error → redirect back with the message + old input.
 *
 * All rules (soft duplicate guard, per-household cap, audit) live in
 * CreateWalkInBeneficiaryAction.
 */
class StoreWalkInBeneficiaryController extends Controller
{
    public function __construct(
        private readonly CreateWalkInBeneficiaryAction $createWalkIn,
        private readonly PhoneFormatterService $phoneFormatter,
    ) {}

    public function __invoke(StoreWalkInBeneficiaryRequest $request): RedirectResponse
    {
        $municipality = app('current_municipality');

        try {
            $dto = CreateWalkInBeneficiaryDto::fromArray(
                $request->validated(),
                $request->user()->id,
                $municipality->id,
                $request->file('identity_id_front'),
                $request->file('identity_id_back'),
                $this->phoneFormatter,
            );

            $beneficiary = $this->createWalkIn->execute($dto);

            return redirect()
                ->route('actionCenter.admin.beneficiary.profile', [
                    'municipality' => $municipality->slug,
                    'beneficiaryId' => $beneficiary->id,
                ])
                ->with('success', 'Walk-in beneficiary '.(trim($beneficiary->full_name) ?: 'record').' was registered.');
        } catch (WalkInBeneficiaryIdentityDocumentStorageException $e) {
            return redirect()
                ->route('actionCenter.admin.beneficiary.profile', [
                    'municipality' => $municipality->slug,
                    'beneficiaryId' => $e->beneficiaryId(),
                ])
                ->with('error', $e->getMessage());
        } catch (RegistrationIdentityCheckException $e) {
            return back()->withInput()->withErrors(['registration_check' => $e->getMessage()]);
        } catch (\DomainException $e) {
            // e.g. per-household member cap hit during fan-out.
            return back()->withInput()->withErrors(['walkin' => $e->getMessage()]);
        }
    }
}
