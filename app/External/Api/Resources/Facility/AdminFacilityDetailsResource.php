<?php

namespace App\External\Api\Resources\Facility;

use Illuminate\Http\Request;

class AdminFacilityDetailsResource extends ClientFacilityDetailsResource
{
    public function toArray(Request $request): array
    {
        return [...parent::toArray($request),
            'is_published' => $this->is_published, 'revision' => $this->revision,
            'operating_status' => $this->operating_status->value, 'operating_notice' => $this->operating_notice,
            'expected_reopens_at_input' => $this->expected_reopens_at?->setTimezone('Asia/Manila')->format('Y-m-d\\TH:i'),
            'audit_log' => $this->whenLoaded('activities', fn () => $this->activities->map(fn ($entry) => [
                'id' => $entry->id, 'description' => $entry->description,
                'created_at' => $entry->created_at->toAtomString(),
            ])->values()),
        ];
    }
}
