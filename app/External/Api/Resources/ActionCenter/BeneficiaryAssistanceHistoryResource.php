<?php

namespace App\External\Api\Resources\ActionCenter;

use App\Core\ActionCenter\Dto\Beneficiary\BeneficiaryAssistanceHistoryEntry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Override;

/** @mixin BeneficiaryAssistanceHistoryEntry */
class BeneficiaryAssistanceHistoryResource extends JsonResource
{
    #[Override]
    public function toArray(Request $request): array
    {
        /** @var BeneficiaryAssistanceHistoryEntry $entry */
        $entry = $this->resource;
        $assistanceRequest = $entry->request;

        return [
            'id' => $assistanceRequest->id,
            'transaction_number' => $assistanceRequest->transaction_number,
            'status' => $assistanceRequest->status?->value,
            'mswd_verification_status' => $assistanceRequest->mswd_verification_status?->value,
            'role' => $entry->role->value,
            'program_name' => $assistanceRequest->assistanceType?->name,
            'amount_approved' => $assistanceRequest->amount_approved !== null
                ? (float) $assistanceRequest->amount_approved
                : null,
            'filer_full_name' => $entry->filerFullName,
            'subject_full_name' => $entry->subjectFullName,
            'submitted_at' => $assistanceRequest->created_at?->toIso8601String(),
            'released_at' => $assistanceRequest->released_at?->toIso8601String(),
        ];
    }
}
