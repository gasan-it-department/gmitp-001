<?php

namespace App\External\Api\Resources\Cemetery\Interments;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IntermentListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $plot = $this->plot;
        $block = $plot?->block;
        $decedent = $this->decedent;

        return [
            'id' => $this->id,
            'decedent_id' => $this->decedent_id,
            'decedent_name' => $decedent ? $this->displayName($decedent) : 'Unknown decedent',
            'plot_id' => $this->plot_id,
            'plot_label' => $plot?->slotLabel,
            'plot_type_label' => $plot?->type?->label(),
            'section_name' => $block?->section?->name,
            'block_name' => $block?->name,
            'interment_date' => $this->interment_date?->format('Y-m-d'),
            'interment_date_label' => $this->interment_date?->format('M d, Y'),
            'type' => $this->type,
            'type_label' => $this->type === 'transfer' ? 'Transfer' : 'Initial Interment',
            'notes' => $this->notes,
        ];
    }

    private function displayName($decedent): string
    {
        if ($decedent->identity_status?->value === 'unidentified') {
            return 'UNIDENTIFIED - '.($decedent->unidentifiedDetail?->case_reference ?? $decedent->id);
        }

        if (! $decedent->has_legal_name && filled($decedent->memorial_name)) {
            return $decedent->memorial_name;
        }

        return trim(sprintf(
            '%s, %s %s',
            $decedent->last_name ?? '',
            $decedent->first_name ?? '',
            $decedent->suffix ?? '',
        ));
    }
}
