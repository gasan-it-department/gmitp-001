<?php

namespace App\External\Api\Controllers\ActionCenter\Walkin;

use App\Core\ActionCenter\Dto\Beneficiary\CreateWalkInBeneficiaryDto;
use App\Core\ActionCenter\Exceptions\PotentialDuplicateBeneficiaryException;
use App\Core\ActionCenter\UseCase\Beneficiary\CreateWalkInBeneficiaryAction;
use App\External\Api\Request\ActionCenter\Walkin\StoreWalkInBeneficiaryRequest;
use App\External\Api\Resources\ActionCenter\Walkin\WalkInBeneficiaryResource;
use App\Http\Controllers\Controller;
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
 *   • Possible duplicate → redirect back with the matches flashed (read by the
 *     Web show controller) so the admin can review and override.
 *   • Other domain error → redirect back with the message + old input.
 *
 * All rules (soft duplicate guard, per-household cap, audit) live in
 * CreateWalkInBeneficiaryAction.
 */
class StoreWalkInBeneficiaryController extends Controller
{
    public function __construct(
        private readonly CreateWalkInBeneficiaryAction $createWalkIn,
    ) {
    }

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
            );

            $beneficiary = $this->createWalkIn->execute($dto);

            return redirect()
                ->route('actionCenter.admin.beneficiary.profile', [
                    'municipality'  => $municipality->slug,
                    'beneficiaryId' => $beneficiary->id,
                ])
                ->with('success', 'Walk-in beneficiary ' . (trim($beneficiary->full_name) ?: 'record') . ' was registered.');
        } catch (PotentialDuplicateBeneficiaryException $e) {
            // Flash the matches so the Web show controller can render them as a
            // prop, and surface a shared error. The form state is preserved by
            // Inertia's useForm on the error response.
            return back()
                ->withInput()
                ->withErrors([
                    'duplicate' => sprintf(
                        'Found %d existing record(s) with this name and birth date. Review them, then register anyway only if this is a different person.',
                        $e->matches->count(),
                    ),
                ])
                ->with('walkinDuplicateMatches', WalkInBeneficiaryResource::collection($e->matches)->resolve($request));
        } catch (\DomainException $e) {
            // e.g. per-household member cap hit during fan-out.
            return back()->withInput()->withErrors(['walkin' => $e->getMessage()]);
        }
    }
}
