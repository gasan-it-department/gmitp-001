<?php

namespace App\Core\ActionCenter\Services;

use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceDisbursement;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\BeneficiaryFlag;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\UseCase\Beneficiary\ResolveBeneficiaryIdentityGroupAction;
use Illuminate\Support\Facades\Schema;

final class CancelledAssistanceRecoveryService
{
    public function history(AssistanceRequest $request): array
    {
        return collect(data_get($request->metadata, 'reopen_history', []))->map(fn ($event) => \Illuminate\Support\Arr::only($event,
            ['approved_amount', 'approved_at', 'approved_by_name', 'cancelled_at', 'cancelled_by_name', 'reopened_at', 'reopened_by_name', 'reason']))->values()->all();
    }

    public function token(AssistanceRequest $request): string
    {
        return hash('sha256', json_encode($request->only([
            'id', 'municipal_id', 'status', 'amount_approved', 'approved_at', 'approved_by_user_id',
            'cancelled_at', 'cancelled_by_user_id', 'updated_at', 'metadata',
        ]), JSON_THROW_ON_ERROR));
    }

    public function blocker(AssistanceRequest $request): ?string
    {
        if ($request->status !== AssistanceStatus::Cancelled || ! $request->approved_at
            || ! $request->approved_by_user_id || (float) $request->amount_approved <= 0 || ! $request->cancelled_at) {
            return 'Only a previously approved request cancelled before payment can be reopened.';
        }
        if ($request->hasReleaseArtifacts()) {
            return 'Release information exists. This request cannot be reopened.';
        }
        if (Schema::hasTable('ac_assistance_disbursements') && AssistanceDisbursement::query()
            ->where('assistance_request_id', $request->id)->whereIn('status', ['preparing', 'ready', 'released'])->exists()) {
            return 'An active or released disbursement exists. Resolve the payment record first.';
        }
        $person = $request->beneficiary;
        if (! $person || $person->municipal_id !== $request->municipal_id) {
            return 'The beneficiary does not belong to this municipality.';
        }
        $resolver = app(ResolveBeneficiaryIdentityGroupAction::class);
        $group = $resolver->execute($person);
        if ($group->canonical->municipal_id !== $request->municipal_id) {
            return 'Resolve the beneficiary identity before reopening.';
        }
        $ids = \App\Core\ActionCenter\Models\Beneficiary::withTrashed()->where('municipal_id', $request->municipal_id)
            ->whereIn('id', $group->beneficiaryIds)->pluck('id')->all();
        if (! $group->canonical->is_active || $group->canonical->isIntakeRejected()) {
            return 'Resolve the beneficiary status or rejected intake before reopening.';
        }
        if (BeneficiaryFlag::query()->whereIn('beneficiary_id', $ids)->where('severity', BeneficiaryFlag::SEVERITY_BLACKLIST)->active()->exists()) {
            return 'The beneficiary has an active blacklist restriction.';
        }
        if (! $request->assistanceType || ! $request->assistanceType->is_active) {
            return 'The assistance program must be active before reopening.';
        }
        $member = $request->onBehalfHouseholdMember;
        if ($member?->beneficiary_id && (! $member->beneficiary || $member->beneficiary->municipal_id !== $request->municipal_id)) {
            return 'Resolve the assisted person identity before reopening.';
        }
        $recipientIds = $member?->beneficiary_id
            ? $resolver->execute($member->beneficiary)->beneficiaryIds : ($member ? [] : $ids);
        $memberIds = HouseholdMember::query()->whereHas('household', fn ($q) => $q->where('municipal_id', $request->municipal_id))
            ->whereIn('beneficiary_id', $recipientIds)->pluck('id')->all();
        if ($request->on_behalf_household_member_id) {
            $memberIds[] = $request->on_behalf_household_member_id;
        }
        $conflict = AssistanceRequest::query()->where('municipal_id', $request->municipal_id)->whereKeyNot($request->id)
            ->whereIn('status', ['pending', 'under_review', 'approved'])
            ->where(fn ($q) => $q->whereIn('beneficiary_id', array_unique([...$ids, ...$recipientIds]))->orWhereIn('on_behalf_household_member_id', $memberIds))
            ->orderBy('id')->first();
        if ($conflict) {
            return 'Resolve the existing open request '.$conflict->transaction_number.' before reopening this request.';
        }
        $cooldown = app(AssistanceCooldownService::class)->evaluate($group->canonical, $request->assistanceType, $member, excludeRequestId: $request->id);

        return $cooldown->hasPermanentBlock ? 'This one-time assistance has already been released.' : null;
    }
}
