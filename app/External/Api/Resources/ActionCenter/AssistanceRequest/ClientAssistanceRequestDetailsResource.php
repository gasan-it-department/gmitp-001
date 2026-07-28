<?php

namespace App\External\Api\Resources\ActionCenter\AssistanceRequest;

use App\Core\ActionCenter\Enums\PhysicalCopyRequirement;
use App\Core\ActionCenter\Enums\EducationalAttainment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Citizen-safe request details. Keep this as an explicit whitelist: the admin
 * resource contains internal case notes, staff identities, and audit metadata.
 */
class ClientAssistanceRequestDetailsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $snapshot = $this->resource->snapshot;

        return [
            'id' => $this->id,
            'transaction_number' => $this->transaction_number,
            'status' => $this->status,
            'assistance_type' => $this->whenLoaded('assistanceType', fn () => [
                'id' => $this->assistanceType->id,
                'name' => $this->assistanceType->name,
                'slug' => $this->assistanceType->slug,
                'description' => $this->assistanceType->description,
                'documents' => $this->assistanceType->relationLoaded('documents')
                    ? $this->assistanceType->documents
                        ->sortBy(fn ($document) => $document->pivot->sort_order ?? 0)
                        ->values()
                        ->map(function ($document) {
                            $physicalCopyRequirement = PhysicalCopyRequirement::tryFrom(
                                (string) ($document->pivot->physical_copy_requirement ?? ''),
                            ) ?? PhysicalCopyRequirement::Unspecified;

                            return [
                                'id' => $document->id,
                                'key' => $document->key,
                                'name' => $document->label,
                                'description' => $document->description,
                                'examples' => $document->examples,
                                'is_required' => (bool) $document->pivot->is_required,
                                'physical_copy_requirement' => $physicalCopyRequirement->value,
                                'physical_copy_requirement_label' => $physicalCopyRequirement->label(),
                            ];
                        })
                        ->all()
                    : [],
            ]),
            'amount_approved' => $this->amount_approved !== null
                ? (float) $this->amount_approved
                : null,
            'description' => $this->description,
            'submitted_at' => $this->created_at?->toIso8601String(),
            'approved_at' => $this->approved_at?->toIso8601String(),
            'released_at' => $this->released_at?->toIso8601String(),
            'privacy_consented_at' => $this->privacy_consented_at?->toIso8601String(),
            'filed_for_self' => $this->relationship_to_beneficiary === null,
            'relationship' => $this->relationship_to_beneficiary
                ? [
                    'value' => $this->relationship_to_beneficiary->value,
                    'label' => $this->relationship_to_beneficiary->label(),
                ]
                : null,
            'on_behalf' => $this->relationship_to_beneficiary
                ? [
                    'full_name' => $this->resolveOnBehalfFullName(),
                    'date_of_death' => $this->on_behalf_date_of_death?->toDateString(),
                    'recipient_id_exception' => $this->recipient_id_exception,
                ]
                : null,
            'identity_snapshot' => [
                'full_name' => $this->resolveSnapshotFullName(),
                'sex' => $snapshot?->sex,
                'birth_date' => $snapshot?->birth_date?->toDateString(),
                'age_at_submission' => $this->calculateAgeAtSubmission(),
                'educational_attainment' => $snapshot?->educational_attainment
                    ? EducationalAttainment::tryFrom($snapshot->educational_attainment)?->label()
                    : null,
                'religion' => $snapshot?->religion,
            ],
            'address_snapshot' => [
                'barangay' => $snapshot?->barangay,
                'full_address' => $this->resolveSnapshotAddress(),
            ],

            // Citizens only need recording state. Raw storage URLs and internal
            // media metadata are intentionally excluded from this resource.
            'documents' => $this->whenLoaded(
                'media',
                fn () => $this->media
                    ->where('collection_name', 'documents')
                    ->map(fn ($media) => [
                        'id' => $media->id,
                        'name' => $media->name,
                        'mime_type' => $media->mime_type,
                        'size' => (int) $media->size,
                        'uploaded_at' => $media->created_at?->toIso8601String(),
                        'custom_properties' => $media->custom_properties ?? [],
                    ])
                    ->values()
                    ->all(),
            ),
        ];
    }

    private function resolveSnapshotFullName(): string
    {
        $snapshot = $this->resource->snapshot;

        return trim(implode(' ', array_filter([
            $snapshot?->first_name,
            $snapshot?->middle_name,
            $snapshot?->last_name,
            $snapshot?->suffix,
        ])));
    }

    private function resolveOnBehalfFullName(): string
    {
        return trim(implode(' ', array_filter([
            $this->on_behalf_first_name,
            $this->on_behalf_middle_name,
            $this->on_behalf_last_name,
            $this->on_behalf_suffix,
        ])));
    }

    private function resolveSnapshotAddress(): string
    {
        $snapshot = $this->resource->snapshot;

        return trim(implode(', ', array_filter([
            $snapshot?->street,
            $snapshot?->barangay,
        ])));
    }

    private function calculateAgeAtSubmission(): ?int
    {
        $birthDate = $this->resource->snapshot?->birth_date;

        if (! $birthDate || ! $this->created_at) {
            return null;
        }

        return $birthDate->diffInYears($this->created_at);
    }
}
