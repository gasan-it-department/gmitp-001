<?php

namespace App\External\Api\Resources\Cemetery\Decedents;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DecedentListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->displayName(),
            'vital_record_type' => $this->vital_record_type?->value,
            'vital_record_label' => $this->vital_record_type?->label(),
            'identity_status' => $this->identity_status?->value,
            'registration_status' => $this->registration_status?->value,
            'registration_status_label' => $this->registration_status?->label(),
            'registration_status_tone' => $this->registration_status?->tone(),
            'life_stage' => $this->life_stage,
            'registry_number' => $this->registry_number ?: 'N/A',
            'date_of_death' => $this->date_of_death?->format('M d, Y') ?? 'N/A',
            'date_of_registration' => $this->date_of_registration?->format('M d, Y'),
            'interment_status' => $this->currentInterment ? 'interred' : 'unassigned',
            'plot_label' => $this->currentInterment?->plot?->slotLabel,
        ];
    }

    private function displayName(): string
    {
        if ($this->identity_status?->value === 'unidentified') {
            return 'UNIDENTIFIED - '.($this->unidentifiedDetail?->case_reference ?? $this->id);
        }
        if (! $this->has_legal_name && filled($this->memorial_name)) {
            return $this->memorial_name.' (MEMORIAL)';
        }

        return trim(sprintf('%s, %s %s %s', $this->last_name, $this->first_name, $this->middle_name, $this->suffix));
    }
}
