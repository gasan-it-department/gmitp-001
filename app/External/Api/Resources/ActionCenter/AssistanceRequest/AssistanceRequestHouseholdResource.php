<?php

namespace App\External\Api\Resources\ActionCenter\AssistanceRequest;

use App\Core\ActionCenter\Dto\Assistance\AssistanceRequestHouseholdMemberData;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssistanceRequestHouseholdResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'source' => $this->resource->source,
            'captured_at' => $this->resource->capturedAt?->toIso8601String(),
            'household_id' => $this->resource->householdId,
            'household_code' => $this->resource->householdCode,
            'member_count' => $this->resource->members->count(),
            'uses_current_fallback' => $this->resource->usesCurrentFallback,
            'members' => $this->resource->members
                ->map(
                    fn (AssistanceRequestHouseholdMemberData $member): array => $member->toArray(),
                )
                ->values()
                ->all(),
        ];
    }
}
