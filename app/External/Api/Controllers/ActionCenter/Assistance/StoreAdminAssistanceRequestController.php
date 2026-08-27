<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\StoreAssistanceRequestDto;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\UseCase\Assistance\StoreAssistanceRequestAction;
use App\Core\ActionCenter\UseCase\Beneficiary\CheckElegibilityAction;
use App\External\Api\Request\ActionCenter\StoreAdminAssistanceRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

/**
 * Admin-encoded assistance request — the in-office counterpart to the citizen
 * self-file flow ({@see StoreAssistanceRequestController}).
 *
 * Route: POST /api/action-center/assistance-request  (admin, tenant via header)
 *
 * Thin by design: it resolves + tenant-guards the beneficiary and program, then
 * hands a `fromAdmin` DTO to the SAME StoreAssistanceRequestAction the online
 * flow uses (which stamps `encoded_by_user_id`, snapshots identity, generates
 * the transaction number, and attaches any uploaded scans). The action's own
 * tenant gate is the final backstop.
 */
class StoreAdminAssistanceRequestController extends Controller
{
    public function __construct(
        private readonly StoreAssistanceRequestAction $storeAssistanceRequest,
        private readonly CheckElegibilityAction $checkEligibility,
    ) {
    }

    public function __invoke(StoreAdminAssistanceRequest $request): RedirectResponse
    {
        $municipalId = app('municipal_id');
        $municipality = app('current_municipality');

        // Beneficiary must belong to THIS municipality (tenant key lives on the
        // household). Load religion + household so the DTO can snapshot them.
        $beneficiary = Beneficiary::query()
            ->with(['household', 'religion'])
            ->whereKey($request->validated('beneficiary_id'))
            ->whereHas('household', fn($q) => $q->where('municipal_id', $municipalId))
            ->first();

        if ($beneficiary === null) {
            return back()
                ->withInput()
                ->withErrors(['beneficiary_id' => 'That beneficiary was not found in your municipality.']);
        }

        // Program must belong to THIS municipality too.
        $assistanceType = AssistanceType::query()
            ->whereKey($request->validated('assistance_type_id'))
            ->where('municipal_id', $municipalId)
            ->first();

        if ($assistanceType === null) {
            return back()
                ->withInput()
                ->withErrors(['assistance_type_id' => 'That assistance program is not available in your municipality.']);
        }

        // Cooldown, in-flight, and verification eligibility is advisory for an
        // admin and may be overridden with a reason. An inactive beneficiary or
        // a household without a verified active Head remains a hard block in
        // StoreAssistanceRequestAction because the household is not authoritative.
        $eligibility = $this->checkEligibility->execute(
            $beneficiary,
            $assistanceType,
            $request->input('on_behalf_household_member_id') ?: null,
            $request->input('on_behalf_date_of_death') ?: null,
        );

        try {
            $dto = StoreAssistanceRequestDto::fromAdmin(
                $request,
                $assistanceType,
                $beneficiary,
                Auth::id(),
                app('current_municipality')->municipal_code,
            );

            $created = $this->storeAssistanceRequest->execute($dto);
        } catch (AuthorizationException | \DomainException $e) {
            return back()
                ->withInput()
                ->withErrors(['request' => $e->getMessage()]);
        }

        // The officer filed despite a standing eligibility or verification gate.
        if (!$eligibility->eligible) {
            activity('assistance_request')
                ->performedOn($created)
                ->causedBy(Auth::user())
                ->withProperties([
                    'override' => true,
                    'reason' => $eligibility->reason,
                    'cooldown_ends_at' => $eligibility->cooldownEndsAt?->toIso8601String(),
                    'message' => $eligibility->message(),
                    'admin_reason' => $request->input('verification_override_reason'),
                    'assistance_type_id' => $assistanceType->id,
                    'beneficiary_id' => $beneficiary->id,
                ])
                ->log('Filed with an administrator override');
        }

        return redirect()
            ->route('actionCenter.admin.show.assistance-request.profile', [
                'municipality' => $municipality->slug,
                'assistanceRequest' => $created->id,
            ])
            ->with('success', "Request {$created->transaction_number} was recorded for {$beneficiary->full_name}.");
    }
}
