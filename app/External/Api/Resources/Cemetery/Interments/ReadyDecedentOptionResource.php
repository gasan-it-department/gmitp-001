<?php

namespace App\External\Api\Resources\Cemetery\Interments;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReadyDecedentOptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'display_name' => $this->displayName(),
            'vital_record_type' => $this->vital_record_type?->value,
            'vital_record_label' => $this->vital_record_type?->label(),
            'identity_status' => $this->identity_status?->value,
            'registry_number' => $this->registry_number,
            'date_of_death' => $this->date_of_death?->format('Y-m-d'),
            'date_of_death_label' => $this->date_of_death?->format('M d, Y'),
        ];
    }

    private function displayName(): string
    {
        if ($this->identity_status?->value === 'unidentified') {
            return 'UNIDENTIFIED - '.($this->unidentifiedDetail?->case_reference ?? $this->id);
        }

        if (! $this->has_legal_name && filled($this->memorial_name)) {
            return $this->memorial_name;
        }

        return trim(sprintf(
            '%s, %s %s',
            $this->last_name ?? '',
            $this->first_name ?? '',
            $this->suffix ?? '',
        ));
    }
}
