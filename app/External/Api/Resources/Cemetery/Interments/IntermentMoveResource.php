<?php

namespace App\External\Api\Resources\Cemetery\Interments;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IntermentMoveResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $plot = $this->plot;
        $block = $plot?->block;
        $section = $block?->section;
        $site = $plot?->cemeterySite;

        return [
            'id' => $this->id,
            'decedent_id' => $this->decedent_id,
            'decedent_name' => $this->displayName(),
            'interment_date' => $this->interment_date?->format('Y-m-d'),
            'type' => $this->type,
            'type_label' => $this->type === 'transfer' ? 'Transfer' : 'Initial Interment',
            'notes' => $this->notes,
            'plot' => $plot ? [
                'id' => $plot->id,
                'cemetery_site_id' => $plot->cemetery_site_id,
                'slot_label' => $plot->slotLabel,
                'type_label' => $plot->type?->label(),
                'status_label' => $plot->status?->label(),
                'active_lease' => $plot->relationLoaded('activeLease') && $plot->activeLease ? [
                    'id' => $plot->activeLease->id,
                    'leaseholder_name' => $plot->activeLease->leaseholder_name,
                    'leaseholder_contact' => $plot->activeLease->leaseholder_contact,
                    'leaseholder_relationship' => $plot->activeLease->leaseholder_relationship,
                    'lease_start' => $plot->activeLease->lease_start?->format('Y-m-d'),
                    'lease_end' => $plot->activeLease->lease_end?->format('Y-m-d'),
                    'or_number' => $plot->activeLease->or_number,
                ] : null,
                'cemetery_site' => $site ? ['id' => $site->id, 'name' => $site->name] : null,
                'section' => $section ? ['id' => $section->id, 'name' => $section->name] : null,
                'block' => $block ? ['id' => $block->id, 'name' => $block->name] : null,
            ] : null,
        ];
    }

    private function displayName(): string
    {
        $decedent = $this->decedent;

        if (! $decedent) {
            return 'Unknown decedent';
        }

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
