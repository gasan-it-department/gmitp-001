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

            // Current interment summary (null when no plot is assigned yet)
            'interment' => $this->whenLoaded('currentInterment', function () {
                if (! $this->currentInterment) {
                    return null;
                }

                $plot = $this->currentInterment->plot;

                return [
                    'id' => $this->currentInterment->id,
                    'status' => $this->currentInterment->status,
                    'interment_date' => $this->currentInterment->interment_date,
                    'plot' => $plot ? [
                        'id' => $plot->id,
                        'plot_number' => $plot->plot_number,
                        'name' => $plot->name,
                        'type' => $plot->type,
                        'status' => $plot->status,
                        'section' => $plot->relationLoaded('section') && $plot->section
                            ? ['id' => $plot->section->id, 'name' => $plot->section->name]
                            : null,
                    ] : null,
                ];
            }),
        ];
    }
}
