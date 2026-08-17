<?php

namespace App\External\Web\Controllers\ActionCenter\Public;

use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\UseCase\Beneficiary\CheckElegibilityAction;
use App\Core\ActionCenter\UseCase\Beneficiary\ResolveApplicantProfileAction;
use App\External\Api\Resources\ActionCenter\AssistanceType\AssistanceTypeDetailsResource;
use App\External\Api\Resources\ActionCenter\Beneficiary\BeneficiaryDetailsResource;
use App\External\Api\Resources\ActionCenter\Household\HouseholdDetailsResource;
use App\External\Api\Resources\ActionCenter\Household\HouseholdMemberOptionResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Renders the assistance request form for an authenticated citizen.
 *
 * Route: GET /{municipality}/action-center/apply/{assistanceType:slug}
 *
 * The slug binding is scoped to the current municipality (see
 * AssistanceType::resolveRouteBinding) so /apply/medical only resolves the
 * Medical program belonging to the tenant whose subdomain is being visited.
 */
class ApplyAssistanceRequestController extends Controller
{
    public function __construct(
        private readonly ResolveApplicantProfileAction $resolveProfile,
        private readonly CheckElegibilityAction $checkEligibility,
    ) {}

    public function __invoke(
        Request $request,
        string $municipality,
        AssistanceType $assistanceType,
    ): Response|RedirectResponse {
        // $assistanceType is already tenant-scoped: AssistanceType::resolveRouteBinding
        // filters by app('municipal_id'), which SetMunicipalityContext binds
        // before SubstituteBindings runs (see bootstrap/app.php priority list).
        $assistanceType->load([
            'documents' => fn ($q) => $q->orderBy('ac_assistance_type_documents.sort_order'),
        ]);

        $beneficiary = $this->resolveProfile->execute($request->user()->id, app('municipal_id'));

        if (! $beneficiary || ! $beneficiary->household) {
            session()->put('url.intended', url()->current());

            return redirect()
                ->route('actionCenter.profile.setup', ['municipality' => $municipality])
                ->with('info', 'Please complete your profile before applying for assistance.');
        }

        if ($beneficiary->isIntakeRejected()) {
            return redirect()
                ->route('actionCenter.portal', ['municipality' => $municipality])
                ->with('error', 'Your beneficiary profile could not be verified by MSWD. Please visit the MSWD office.');
        }

        if (! $beneficiary->isIdentityVerified()) {
            return redirect()
                ->route('actionCenter.portal', ['municipality' => $municipality])
                ->with('info', 'Your beneficiary profile is awaiting MSWD identity verification.');
        }

        if (! $beneficiary->is_active || ! $beneficiary->household->isVerified()) {
            return redirect()
                ->route('actionCenter.portal', ['municipality' => $municipality])
                ->with(
                    'error',
                    ! $beneficiary->is_active
                    ? 'Your beneficiary record is inactive. Please visit the MSWD office.'
                    : 'Your household is on hold until MSWD assigns a verified head of household.',
                );
        }

        // Don't render a dead form: bounce STANDARD programs the citizen can't
        // currently file (cooldown / in-flight / one-time) back to the portal
        // with the friendly message. Burial is independent + per-deceased — its
        // gate depends on which deceased is chosen, so the form always loads and
        // the store enforces it.

        if (! $assistanceType->is_independent) {
            $eligibility = $this->checkEligibility->execute($beneficiary, $assistanceType);

            if (! $eligibility->eligible) {
                return redirect()
                    ->route('actionCenter.portal', ['municipality' => $municipality])
                    ->with('error', $eligibility->message());
            }
        }

        // Roster the citizen can pick from when filing on behalf of a family
        // member. Soft-deleted and inactive ("moved out") rows are excluded.
        $householdMembers = HouseholdMember::query()
            ->where('household_id', $beneficiary->household_id)
            ->where('is_active', true)
            ->orderBy('first_name')
            ->get();

        return Inertia::render('ActionCenter/Client/Apply/ApplyAssistance', [
            'assistanceType' => new AssistanceTypeDetailsResource($assistanceType),
            'relationships' => Relationship::assistanceRepresentativeOptions(),
            'beneficiary' => new BeneficiaryDetailsResource($beneficiary),
            'household' => new HouseholdDetailsResource($beneficiary->household),
            'householdMembers' => HouseholdMemberOptionResource::collection($householdMembers),

            'submitUrl' => route('actionCenter.apply.assistance.store', [
                'municipality' => $municipality,
                'assistanceType' => $assistanceType->slug,
            ]),
            'storeHouseholdMemberUrl' => route('actionCenter.household.members.store'),
        ]);
    }
}
