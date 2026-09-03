<?php

namespace App\External\Api\Resources\ActionCenter\AssistanceRequest;

use App\Core\ActionCenter\Contracts\AssistanceRequestFormDefinitionProvider;
use App\Core\ActionCenter\Enums\PhysicalCopyRequirement;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Full payload for the admin request-detail page.
 *
 * Sibling resource to {@see AssistanceRequestListResource}, which intentionally
 * stays lean for table rows. This one carries everything the reviewer needs to
 * decide: full identity & address snapshots, description / remarks, the
 * representative ("on behalf of") block, document metadata with custom
 * properties, the workflow audit trail, and the privacy-consent stamp.
 *
 * Eager-load to avoid N+1:
 *
 *     $request->load([
 *         'assistanceType',
 *         'encodedBy',
 *         'reviewedBy',
 *         'approvedBy',
 *         'media',
 *     ]);
 */
class AssistanceRequestDetailsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $snapshot = $this->resource->snapshot;
        $householdAssessment = data_get($this->metadata, 'household_assessment_snapshot');

        return [
            // ── Identification ───────────────────────────────────────────────
            'id' => $this->id,
            'transaction_number' => $this->transaction_number,
            'status' => $this->status,

            // ── Program ──────────────────────────────────────────────────────
            'assistance_type' => $this->whenLoaded('assistanceType', fn () => [
                'id' => $this->assistanceType->id,
                'name' => $this->assistanceType->name,
                'slug' => $this->assistanceType->slug,
                'description' => $this->assistanceType->description,
                'min_amount' => $this->assistanceType->min_amount !== null ? (float) $this->assistanceType->min_amount : null,
                'max_amount' => $this->assistanceType->max_amount !== null ? (float) $this->assistanceType->max_amount : null,
                'cooldown_months' => (int) $this->assistanceType->cooldown_months,
                'cooldown_type' => $this->assistanceType->cooldown_type,
                'cooldown_scope' => $this->assistanceType->cooldown_scope,
                'enabled_generated_documents' => $this->assistanceType->generatedDocumentValues(),
                'request_form' => $this->requestFormDefinition($this->assistanceType->slug),
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

            // ── Money — null until the approver fills it ─────────────────────
            'amount_approved' => $this->amount_approved !== null ? (float) $this->amount_approved : null,

            // ── Free-text fields ─────────────────────────────────────────────
            'description' => $this->description,    // citizen's stated reason
            'remarks' => $this->remarks,        // admin's internal notes

            // ── Workflow timestamps (ISO 8601, UTC) ──────────────────────────
            'submitted_at' => $this->created_at?->toIso8601String(),
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'approved_at' => $this->approved_at?->toIso8601String(),
            'released_at' => $this->released_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),

            // ── Audit trail (who did what) ───────────────────────────────────
            'is_walkin' => $this->encoded_by_user_id !== null,
            'encoded_by' => $this->whenLoaded('encodedBy', fn () => $this->encodedBy ? $this->shortUser($this->encodedBy) : null),
            'reviewed_by' => $this->whenLoaded('reviewedBy', fn () => $this->reviewedBy ? $this->shortUser($this->reviewedBy) : null),
            'approved_by' => $this->whenLoaded('approvedBy', fn () => $this->approvedBy ? $this->shortUser($this->approvedBy) : null),
            'cancelled_by' => $this->whenLoaded('cancelledBy', fn () => $this->cancelledBy ? $this->shortUser($this->cancelledBy) : null),

            // ── Representative — null when filed for self ────────────────────
            'filed_for_self' => $this->relationship_to_beneficiary === null,
            'relationship' => $this->relationship_to_beneficiary
                ? [
                    'value' => $this->relationship_to_beneficiary->value,
                    'label' => $this->relationship_to_beneficiary->label(),
                ]
                : null,
            'on_behalf' => $this->relationship_to_beneficiary
                ? [
                    'first_name' => $this->on_behalf_first_name,
                    'middle_name' => $this->on_behalf_middle_name,
                    'last_name' => $this->on_behalf_last_name,
                    'suffix' => $this->on_behalf_suffix,
                    'full_name' => $this->resolveOnBehalfFullName(),
                    'birth_date' => $this->on_behalf_birth_date?->toDateString(),
                    'date_of_death' => $this->on_behalf_date_of_death?->toDateString(),
                    'recipient_id_exception' => $this->recipient_id_exception,
                    'recipient_id_exception_reason' => $this->recipient_id_exception_reason,
                ]
                : null,

            // ── Identity snapshot (frozen at submission) ─────────────────────
            'identity_snapshot' => [
                'first_name' => $snapshot?->first_name,
                'middle_name' => $snapshot?->middle_name,
                'last_name' => $snapshot?->last_name,
                'suffix' => $snapshot?->suffix,
                'full_name' => $this->resolveSnapshotFullName(),
                'sex' => $snapshot?->sex,
                'birth_date' => $snapshot?->birth_date?->toDateString(),
                'age_at_submission' => $this->calculateAgeAtSubmission(),
                'educational_attainment' => $snapshot?->educational_attainment
                    ? \App\Core\ActionCenter\Enums\EducationalAttainment::tryFrom($snapshot->educational_attainment)?->label()
                    : null,
                'religion' => $snapshot?->religion,
            ],

            // ── Address snapshot (frozen at submission) ──────────────────────
            'address_snapshot' => [
                'street' => $snapshot?->street,
                'barangay' => $snapshot?->barangay,
                'barangay_psgc_code' => $snapshot?->barangay_psgc_code,
                'full_address' => $this->resolveSnapshotAddress(),
            ],

            // ── Privacy / consent (RA 10173 evidence) ────────────────────────
            'privacy_consented_at' => $this->privacy_consented_at?->toIso8601String(),
            'privacy_notice_version' => $this->privacy_notice_version,

            // ── Beneficiary / household references ───────────────────────────
            'beneficiary_id' => $this->beneficiary_id,
            // Live human-friendly ID of the beneficiary (e.g. GAS-000123).
            // Present when the beneficiary relation is eager-loaded.
            'beneficiary_number' => $this->whenLoaded('beneficiary', fn () => $this->beneficiary?->beneficiary_number),
            'contact_phone' => $this->whenLoaded('beneficiary', fn () => $this->beneficiary?->contact_phone),
            'household_id' => $this->household_id,
            'household_assessment' => is_array($householdAssessment)
                ? [
                    'captured_at' => $householdAssessment['captured_at'] ?? null,
                    'member_count' => is_array($householdAssessment['members'] ?? null)
                        ? count($householdAssessment['members'])
                        : 0,
                    'source' => $householdAssessment['source'] ?? 'mswd_interview',
                ]
                : null,

            // ── Uploaded documents (via spatie media) ────────────────────────
            // All uploads share the single spatie collection "documents"; the
            // ac_document_types.key slot each file satisfies is in
            // `custom_properties.document_key` (NOT collection_name). The
            // frontend must match required-document slots on document_key.
            // `uuid` is spatie's public identifier; the frontend uses it to
            // build a signed download URL when that route exists.
            'documents' => $this->whenLoaded(
                'media',
                fn () => $this->media
                    ->map(fn ($m) => [
                        'id' => $m->id,
                        'uuid' => $m->uuid,
                        'collection_name' => $m->collection_name,
                        'name' => $m->name,
                        'file_name' => $m->file_name,
                        'mime_type' => $m->mime_type,
                        'size' => (int) $m->size,
                        'url' => $m->disk === 's3' ? $m->getTemporaryUrl(now()->addMinutes(60)) : $m->getUrl(),
                        'uploaded_at' => $m->created_at?->toIso8601String(),
                        'custom_properties' => $m->custom_properties ?? [],
                    ])
                    ->values()
                    ->all()
            ),

            // ── System ───────────────────────────────────────────────────────
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Lightweight user payload — only what the audit-trail row needs.
     *
     * Composes a display name from the first/last/middle columns since the
     * User model does NOT have a single `name` column. Falls back to
     * `user_name` (login handle) if both first and last are empty, so the
     * audit row never renders blank.
     *
     * @return array{id: string, name: string}
     */
    private function shortUser($user): array
    {
        $fullName = trim(implode(' ', array_filter([
            $user->first_name,
            $user->last_name,
        ])));

        return [
            'id' => $user->id,
            'name' => $fullName !== '' ? $fullName : ($user->user_name ?? 'Unknown user'),
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

    /**
     * Age the beneficiary was when they submitted this request — useful for
     * eligibility review (e.g. legal-age rules on representative filings).
     * Returns null if the snapshot didn't capture a birth date.
     */
    private function calculateAgeAtSubmission(): ?int
    {
        $birthDate = $this->resource->snapshot?->birth_date;

        if (! $birthDate || ! $this->created_at) {
            return null;
        }

        return $birthDate->diffInYears($this->created_at);
    }

    private function requestFormDefinition(?string $assistanceTypeSlug): array
    {
        $municipalCode = app()->bound('current_municipality')
            ? app('current_municipality')->municipal_code
            : null;

        return app(AssistanceRequestFormDefinitionProvider::class)
            ->for($municipalCode, $assistanceTypeSlug)
            ->toArray();
    }
}
