<?php

namespace App\External\Api\Resources\Cemetery;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Full decedent profile payload, including the current interment + plot snapshot
 * so the Profile screen can render plot/section/interment data without an
 * extra round trip.
 */
class DecedentDetailsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'middle_name' => $this->middle_name,
            'suffix' => $this->suffix,
            'memorial_name' => $this->memorial_name,
            'gender' => $this->gender,
            'age_at_death' => $this->age,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'date_of_death' => $this->date_of_death?->format('Y-m-d'),
            'date_of_registration' => $this->date_of_registration?->format('Y-m-d'),
            'decedent_type' => $this->decedent_type?->value,
            'reference_document_type' => $this->reference_document_type,
            'reference_document_number' => $this->reference_document_number,
            'place_of_death' => $this->place_of_death,
            'cause_of_death' => $this->cause_of_death,
            'death_certificate_no' => $this->death_certificate_no,
            'notes' => $this->notes,
            'address_id' => $this->address_id,

            // Identification layer (Spatie MediaLibrary). avatar is a single photo;
            // identification is the supporting-document set.
            'avatar_url' => $this->getFirstMediaUrl('avatar') ?: null,
            'identification' => $this->getMedia('identification')->map(fn ($media) => [
                'id' => $media->id,
                'name' => $media->file_name,
                'url' => $media->getUrl(),
                'mime_type' => $media->mime_type,
            ])->values()->all(),

            // Current interment summary (null when no plot is assigned yet).
            // Schema note: interment.status was removed in the event-typed
            // pivot — exhumation/transfer soft-delete the row. We surface
            // `type` ('initial' | 'transfer') instead. Plot section is now
            // reached via block; `slot_label` is the canonical display id.
            'interment' => $this->whenLoaded('currentInterment', function () {
                if (! $this->currentInterment) {
                    return null;
                }

                $plot = $this->currentInterment->plot;
                $parent = $plot?->relationLoaded('parent') ? $plot->parent : null;
                $block = $plot?->relationLoaded('block') ? $plot->block : null;
                $section = $block?->relationLoaded('section') ? $block->section : null;

                return [
                    'id' => $this->currentInterment->id,
                    'type' => $this->currentInterment->type,
                    'notes' => $this->currentInterment->notes,
                    'interment_date' => $this->currentInterment->interment_date?->format('Y-m-d'),
                    'plot' => $plot ? [
                        'id' => $plot->id,
                        'name' => $plot->name,
                        'slot_label' => $plot->slotLabel,
                        'type' => $plot->type?->value,
                        'status' => $plot->status?->value,
                        'level' => $plot->level,
                        'position' => $plot->position,
                        'parent' => $parent ? [
                            'id' => $parent->id,
                            'name' => $parent->name,
                        ] : null,
                        'block' => $block ? [
                            'id' => $block->id,
                            'name' => $block->name,
                        ] : null,
                        'section' => $section ? [
                            'id' => $section->id,
                            'name' => $section->name,
                        ] : null,
                    ] : null,
                ];
            }),
        ];
    }
}
