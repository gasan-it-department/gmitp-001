<?php

namespace App\External\Web\Controllers\ActionCenter\Public;

use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\UseCase\Beneficiary\ResolveApplicantProfileAction;
use App\External\Api\Resources\ActionCenter\AssistanceTypeDetailsResource;
use App\External\Api\Resources\ActionCenter\BeneficiaryDetailsResource;
use App\External\Api\Resources\ActionCenter\HouseholdDetailsResource;
use App\External\Api\Resources\ActionCenter\HouseholdMemberOptionResource;
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
    ) {
    }

    public function __invoke(
        Request $request,
        string $municipality,
        AssistanceType $assistanceType,
    ): Response|RedirectResponse {
        $assistanceType->load([
            'documents' => fn($q) => $q->orderBy('ac_assistance_type_documents.sort_order'),
        ]);

        $beneficiary = $this->resolveProfile->execute($request->user()->id);

        if (!$beneficiary || !$beneficiary->household) {
            session()->put('url.intended', url()->current());

            return redirect()
                ->route('actionCenter.profile.setup', ['municipality' => $municipality])
                ->with('info', 'Please complete your profile before applying for assistance.');
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
            'relationships' => Relationship::toOptions(),
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
