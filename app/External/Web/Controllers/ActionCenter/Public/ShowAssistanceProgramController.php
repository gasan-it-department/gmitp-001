<?php

namespace App\External\Web\Controllers\ActionCenter\Public;

use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\UseCase\Assistance\GetActiveAssistanceTypeBySlugAction;
use App\Core\ActionCenter\UseCase\Beneficiary\CheckElegibilityAction;
use App\Core\ActionCenter\UseCase\Beneficiary\ResolveApplicantProfileAction;
use App\External\Api\Resources\ActionCenter\AssistanceType\AssistanceTypeDetailsResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShowAssistanceProgramController extends Controller
{
    public function __construct(
        private readonly GetActiveAssistanceTypeBySlugAction $getAssistanceType,
        private readonly ResolveApplicantProfileAction $resolveProfile,
        private readonly CheckElegibilityAction $checkEligibility,
    ) {}

    public function __invoke(
        Request $request,
        string $municipality,
        string $assistanceType,
    ): Response {
        $type = $this->getAssistanceType->execute(app('municipal_id'), $assistanceType);
        $beneficiary = $this->resolveProfile->execute(
            $request->user()->id,
            app('municipal_id'),
        );

        return Inertia::render('ActionCenter/Public/AssistanceProgramDetails', [
            'assistanceType' => new AssistanceTypeDetailsResource($type),
            'applicationState' => $this->resolveApplicationState($beneficiary, $type),
        ]);
    }

    /**
     * @return array{status: string, reason: ?string, message: string, cooldown_ends_at: ?string}
     */
    private function resolveApplicationState(
        ?Beneficiary $beneficiary,
        AssistanceType $assistanceType,
    ): array {
        if ($beneficiary === null || $beneficiary->household === null) {
            return [
                'status' => 'no_profile',
                'reason' => null,
                'message' => 'Create your beneficiary profile before submitting an assistance request.',
                'cooldown_ends_at' => null,
            ];
        }

        if ($beneficiary->isIntakeRejected()) {
            return [
                'status' => 'rejected',
                'reason' => 'intake_rejected',
                'message' => 'Your beneficiary profile needs correction before you can apply.',
                'cooldown_ends_at' => null,
            ];
        }

        if (! $beneficiary->isIdentityVerified()) {
            return [
                'status' => 'pending',
                'reason' => 'identity_unverified',
                'message' => 'Your beneficiary profile is awaiting MSWD verification.',
                'cooldown_ends_at' => null,
            ];
        }

        $eligibility = $this->checkEligibility->execute($beneficiary, $assistanceType);

        return [
            'status' => $eligibility->eligible ? 'eligible' : 'blocked',
            ...$eligibility->toArray(),
        ];
    }
}
