<?php

namespace App\External\Api\Resources\GoodsDistribution;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class GoodsRecipientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $membership = $this->household->activeMembers->firstWhere('beneficiary_id', $this->id);

        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'beneficiary_number' => $this->beneficiary_number,
            'birth_date' => $this->birth_date?->toDateString(),
            'is_active' => $this->is_active && $this->merged_into_beneficiary_id === null,
            'identity_verified' => $this->identity_verified_at !== null,
            'active_member_id' => $membership?->id,
            'relationship' => $membership?->relationship,
            'household' => new RegistrationHouseholdResource($this->household),
            'roster' => $this->household->activeMembers->map(fn ($member) => [
                'id' => $member->id,
                'beneficiary_id' => $member->beneficiary_id,
                'full_name' => trim(implode(' ', array_filter([$member->first_name, $member->middle_name, $member->last_name, $member->suffix]))),
                'relationship' => $member->relationship,
            ]),
        ];
    }
}
