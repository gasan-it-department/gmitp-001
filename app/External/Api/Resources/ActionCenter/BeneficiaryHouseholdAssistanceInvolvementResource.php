<?php

namespace App\External\Api\Resources\ActionCenter;

use App\Core\ActionCenter\Dto\Beneficiary\BeneficiaryHouseholdAssistanceInvolvementEntry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Override;

/** @mixin BeneficiaryHouseholdAssistanceInvolvementEntry */
class BeneficiaryHouseholdAssistanceInvolvementResource extends JsonResource
{
    #[Override]
    public function toArray(Request $request): array
    {
        /** @var BeneficiaryHouseholdAssistanceInvolvementEntry $entry */
        $entry = $this->resource;
        $assistanceRequest = $entry->request;

        return [
            'id' => $assistanceRequest->id,
            'transaction_number' => $assistanceRequest->transaction_number,
            'status' => $assistanceRequest->status?->value,
            'mswd_verification_status' => $assistanceRequest->mswd_verification_status?->value,
            'program_name' => $assistanceRequest->assistanceType?->name,
            'amount_approved' => $assistanceRequest->amount_approved !== null
                ? (float) $assistanceRequest->amount_approved
                : null,
            'filer_full_name' => $entry->filerFullName,
            'subject_full_name' => $entry->subjectFullName,
            'household_code' => $entry->householdCode,
            'submitted_at' => $assistanceRequest->created_at?->toIso8601String(),
            'released_at' => $assistanceRequest->released_at?->toIso8601String(),
            'cooldown' => [
                'state' => $entry->cooldownState,
                'starts_at' => $entry->cooldownStartsAt?->format(DATE_ATOM),
                'expires_at' => $entry->cooldownExpiresAt?->format(DATE_ATOM),
            ],
        ];
    }
}
