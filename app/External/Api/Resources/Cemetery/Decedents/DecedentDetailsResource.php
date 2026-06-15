<?php

namespace App\External\Api\Resources\Cemetery\Decedents;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DecedentDetailsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $municipality = app('current_municipality');

        return [
            'id' => $this->id,
            'version' => $this->version,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'middle_name' => $this->middle_name,
            'suffix' => $this->suffix,
            'memorial_name' => $this->memorial_name,
            'has_legal_name' => $this->has_legal_name,
            'gender' => $this->gender,
            'age_at_death' => $this->age,
            'life_stage' => $this->life_stage,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'date_of_death' => $this->date_of_death?->format('Y-m-d'),
            'date_of_registration' => $this->date_of_registration?->format('Y-m-d'),
            'vital_record_type' => $this->vital_record_type?->value,
            'vital_record_label' => $this->vital_record_type?->label(),
            'identity_status' => $this->identity_status?->value,
            'registration_status' => $this->registration_status?->value,
            'registration_status_label' => $this->registration_status?->label(),
            'registration_status_tone' => $this->registration_status?->tone(),
            'registry_number' => $this->registry_number,
            'place_of_death' => $this->place_of_death,
            'cause_of_death' => $this->cause_of_death,
            'notes' => $this->notes,
            'psgc_municipality_id' => $this->psgc_municipality_id ? (string) $this->psgc_municipality_id : null,
            'psgc_barangay_code' => $this->psgc_barangay_code,
            'street_name' => $this->street_name,
            'verified_at' => $this->verified_at?->toIso8601String(),
            'verified_by' => $this->verifier ? $this->verifier->full_name : null,
            'avatar_url' => $this->getFirstMedia('avatar')
                ? route('cemetery.admin.decedents.avatar', [$municipality->slug, $this->id])
                : null,
            'documents' => $this->whenLoaded('documents', fn () => $this->documents->map(fn ($document) => [
                'id' => $document->id,
                'supersedes_id' => $document->supersedes_id,
                'type' => $document->type->value,
                'type_label' => $document->type->label(),
                'restricted' => $document->type->isRestricted(),
                'document_number' => $document->document_number,
                'issued_at' => $document->issued_at?->format('Y-m-d'),
                'notes' => $document->notes,
                'verification_status' => $document->verification_status->value,
                'verified_at' => $document->verified_at?->toIso8601String(),
                'verified_by' => $document->verifier?->full_name,
                'file_name' => $document->getFirstMedia('file')?->file_name,
                'mime_type' => $document->getFirstMedia('file')?->mime_type,
                'download_url' => route('cemetery.admin.decedents.documents.download', [
                    $municipality->slug, $this->id, $document->id,
                ]),
            ])->values()),
            'unidentified_details' => $this->whenLoaded('unidentifiedDetail', fn () => $this->unidentifiedDetail ? [
                'case_reference' => $this->unidentifiedDetail->case_reference,
                'found_location' => $this->unidentifiedDetail->found_location,
                'date_found' => $this->unidentifiedDetail->date_found?->format('Y-m-d'),
                'reported_by' => $this->unidentifiedDetail->reported_by,
                'reporting_agency' => $this->unidentifiedDetail->reporting_agency,
                'estimated_age' => $this->unidentifiedDetail->estimated_age,
                'estimated_sex' => $this->unidentifiedDetail->estimated_sex,
                'distinguishing_features' => $this->unidentifiedDetail->distinguishing_features,
                'physical_description' => $this->unidentifiedDetail->physical_description,
                'requires_medico_legal' => $this->unidentifiedDetail->requires_medico_legal,
            ] : null),
            'fetal_details' => $this->whenLoaded('fetalDeathDetail', fn () => $this->fetalDeathDetail ? [
                'gestational_age_weeks' => $this->fetalDeathDetail->gestational_age_weeks,
                'fetal_weight_grams' => $this->fetalDeathDetail->fetal_weight_grams,
                'mother_name' => $this->fetalDeathDetail->mother_name,
            ] : null),
            'corrections' => $this->whenLoaded('corrections', fn () => $this->corrections->sortByDesc('created_at')->map(fn ($correction) => [
                'id' => $correction->id,
                'base_version' => $correction->base_version,
                'status' => $correction->status->value,
                'reason' => $correction->reason,
                'original_values' => $correction->original_values,
                'proposed_changes' => $correction->proposed_changes,
                'requested_by' => $correction->requester?->full_name,
                'reviewed_by' => $correction->reviewer?->full_name,
                'review_notes' => $correction->review_notes,
                'evidence_url' => $correction->getFirstMedia('evidence') ? route(
                    'cemetery.admin.decedents.corrections.evidence',
                    [$municipality->slug, $this->id, $correction->id]
                ) : null,
                'created_at' => $correction->created_at?->toIso8601String(),
            ])->values()),
            'audit_timeline' => $this->relationLoaded('auditActivities')
                ? $this->auditActivities->map(fn ($activity) => [
                    'id' => $activity->id,
                    'event' => $activity->event,
                    'description' => $activity->description,
                    'causer' => $activity->causer?->full_name,
                    'changes' => $activity->changes,
                    'properties' => $activity->properties,
                    'created_at' => $activity->created_at?->toIso8601String(),
                ])->values()
                : [],
            'interment_readiness' => $this->relationLoaded('intermentReadiness') ? $this->intermentReadiness : null,
            'interment' => $this->intermentPayload(),
        ];
    }

    private function intermentPayload(): ?array
    {
        if (! $this->relationLoaded('currentInterment') || ! $this->currentInterment) {
            return null;
        }

        $plot = $this->currentInterment->plot;
        $block = $plot?->block;

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
                'parent' => $plot->parent ? ['id' => $plot->parent->id, 'name' => $plot->parent->name] : null,
                'block' => $block ? ['id' => $block->id, 'name' => $block->name] : null,
                'section' => $block?->section ? ['id' => $block->section->id, 'name' => $block->section->name] : null,
            ] : null,
        ];
    }
}
