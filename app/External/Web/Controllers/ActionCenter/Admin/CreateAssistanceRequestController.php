<?php

namespace App\External\Web\Controllers\ActionCenter\Admin;

use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\UseCase\Beneficiary\CheckElegibilityAction;
use App\External\Api\Resources\ActionCenter\AssistanceType\AssistanceTypeDetailsResource;
use App\External\Api\Resources\ActionCenter\Beneficiary\BeneficiaryProfileResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin: show the "file an assistance request on behalf of this beneficiary"
 * form.
 *
 * Route: GET /{municipality}/action-center/admin/beneficiary/{beneficiaryId}/file-assistance
 *
 * Display-only (per the Web = render / Api = mutate split). The form is
 * ANCHORED to an existing, verified beneficiary — identity is shown read-only
 * and never re-typed — which is the whole point of routing through a chosen
 * beneficiary rather than re-collecting a person. The POST goes to
 * StoreAdminAssistanceRequestController.
 */
class CreateAssistanceRequestController extends Controller
{
    public function __construct(
        private readonly CheckElegibilityAction $checkEligibility,
    ) {}

    public function __invoke(string $municipality, string $beneficiaryId): Response
    {
        $municipalId = app('municipal_id');

        // Tenant guard: the beneficiary must live in this municipality (tenant
        // key is on the household). 404 on a miss — never leak existence.
        $beneficiary = Beneficiary::query()
            ->with(['household', 'religion', 'user', 'identityVerifier'])
            ->whereKey($beneficiaryId)
            ->whereHas('household', fn ($q) => $q->where('municipal_id', $municipalId))
            ->firstOrFail();

        // Active programs for this municipality, each with its required-document
        // slots so the form can render uploads once a type is chosen.
        $assistanceTypes = AssistanceType::query()
            ->where('municipal_id', $municipalId)
            ->where('is_active', true)
            ->with(['documents' => fn ($q) => $q->orderBy('ac_assistance_type_documents.sort_order')])
            ->orderBy('name')
            ->get();

        // Advisory cooldown state per program for this beneficiary. The admin is
        // NOT blocked (emergency override) — this only surfaces a warning. Burial
        // is independent + per-deceased, so it shows eligible here (no deceased
        // chosen yet); its real gate is the per-deceased check at submit time.
        $eligibilityByType = collect($this->checkEligibility->executeBatch($beneficiary, $assistanceTypes))
            ->map(fn ($result) => $result->toArray())
            ->all();

        return Inertia::render('ActionCenter/Admin/Assistance/Create/CreateAssistanceRequest', [
            'beneficiary' => new BeneficiaryProfileResource($beneficiary),
            'assistanceTypes' => AssistanceTypeDetailsResource::collection($assistanceTypes),
            'eligibilityByType' => $eligibilityByType,
            'submitUrl' => route('actionCenter.assistance.admin-store'),
        ]);
    }
}
