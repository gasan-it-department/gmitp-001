<?php

namespace App\External\Api\Resources\ActionCenter\Household;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Override;

class HouseholdProfileResource extends JsonResource
{
    #[Override]
    public function toArray(Request $request): array
    {
        $head = $this->relationLoaded('activeHead') ? $this->activeHead : null;

        return [
            'id' => $this->id,
            'household_code' => $this->household_code,
            'barangay' => $this->barangay,
            'barangay_psgc_code' => $this->barangay_psgc_code,
            'street' => $this->street,
            'is_verified' => $this->isVerified(),
            'is_on_hold' => $head === null,
            'head' => $head ? [
                'member_id' => $head->id,
                'beneficiary_id' => $head->beneficiary_id,
                'full_name' => trim(implode(' ', array_filter([
                    $head->first_name,
                    $head->middle_name,
                    $head->last_name,
                    $head->suffix,
                ]))),
                'beneficiary_number' => $head->beneficiary?->beneficiary_number,
                'identity_verified' => $head->beneficiary?->identity_verified_at !== null,
            ] : null,
            'permissions' => [
                'manage' => $request->user()?->can('action_center.beneficiaries.manage') ?? false,
                'correct' => $request->user()?->can('action_center.beneficiaries.correct') ?? false,
                'verify' => $request->user()?->can('action_center.beneficiaries.verify') ?? false,
                'view_requests' => $request->user()?->can('action_center.requests.view') ?? false,
            ],
        ];
    }
}
