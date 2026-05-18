<?php

namespace App\External\Api\Resources\ActionCenter;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Lean, row-level payload for tables that list assistance requests.
 *
 * Serves both citizen-facing views ("My Requests") and admin-facing views
 * (the MSWD review queue). Exposes only the fields needed to RENDER A ROW —
 * the full identity snapshot, free-text description, remarks, and per-file
 * download URLs live in {@see AssistanceRequestDetailsResource} (separate
 * resource for the show page).
 *
 * To avoid N+1, eager-load relations the consumer needs before paginating:
 *
 *     AssistanceRequest::query()
 *         ->with(['assistanceType', 'media'])
 *         ->latest('created_at')
 *         ->paginate(20);
 *
 * Fields driven by `whenLoaded()` are silently omitted from the JSON when the
 * relation isn't loaded — this keeps the resource safe to use even in
 * contexts where you intentionally skip relations for performance.
 */
class AssistanceRequestListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            // ── Identification ───────────────────────────────────────────────
            'id'                 => $this->id,
            'transaction_number' => $this->transaction_number,

            // ── Workflow state ───────────────────────────────────────────────
            // Raw status string; frontend handles label/colour mapping for i18n.
            // Values: pending | under_review | approved | released | rejected | cancelled
            'status' => $this->status,

            // ── Program ──────────────────────────────────────────────────────
            'assistance_type_id' => $this->assistance_type_id,
            'assistance_type'    => $this->whenLoaded('assistanceType', fn () => [
                'id'   => $this->assistanceType->id,
                'name' => $this->assistanceType->name,
                'slug' => $this->assistanceType->slug,
            ]),

            // ── Money ────────────────────────────────────────────────────────
            // Null until the approver fills it. Cast to float because the
            // model casts to decimal:2 (returns string), which is awkward for
            // JS clients doing arithmetic / sorting.
            'amount_approved' => $this->amount_approved !== null
                ? (float) $this->amount_approved
                : null,

            // ── Timestamps (ISO 8601, UTC) ───────────────────────────────────
            // `submitted_at` mirrors created_at semantically — kept distinct so
            // the frontend doesn't have to reason about which timestamp to show.
            'submitted_at' => $this->created_at?->toIso8601String(),
            'approved_at'  => $this->approved_at?->toIso8601String(),
            'released_at'  => $this->released_at?->toIso8601String(),

            // ── Applicant context ────────────────────────────────────────────
            // True = citizen filed for themselves.
            // False = filed via an authorised representative (e.g. burial).
            'filed_for_self' => $this->relationship_to_beneficiary === null,

            // Relationship enum payload — `null` when filed for self.
            'relationship' => $this->relationship_to_beneficiary
                ? [
                    'value' => $this->relationship_to_beneficiary->value,
                    'label' => $this->relationship_to_beneficiary->label(),
                ]
                : null,

            // Display name of the SUBJECT of the request (the person who
            // would receive the assistance), sourced from the request's
            // identity snapshot OR the on_behalf_* fields — never from the
            // live beneficiary record, so historical rows stay accurate even
            // if the beneficiary later edits their profile.
            'subject_full_name' => $this->resolveSubjectFullName(),

            // Useful for admin filters: "show online submissions only" /
            // "show walk-ins only". Online self-filed has encoded_by_user_id = null.
            'is_walkin' => $this->encoded_by_user_id !== null,

            // ── Address snapshot (for admin barangay filters) ────────────────
            'snapshot_barangay'           => $this->snapshot_barangay,
            'snapshot_barangay_psgc_code' => $this->snapshot_barangay_psgc_code,

            // ── FK references (admin drill-down) ─────────────────────────────
            'beneficiary_id' => $this->beneficiary_id,
            'household_id'   => $this->household_id,

            // ── Attachments summary ──────────────────────────────────────────
            // Only emitted when the `media` relation is eager-loaded.
            // - documents_count       → for a "3 files" badge in the row
            // - documents_uploaded    → array of collection keys, lets the UI
            //                           tick off which doc types are present
            //                           without a per-row download fetch
            'documents_count' => $this->whenLoaded(
                'media',
                fn () => $this->media->count()
            ),
            'documents_uploaded' => $this->whenLoaded(
                'media',
                fn () => $this->media
                    ->pluck('collection_name')
                    ->unique()
                    ->values()
                    ->all()
            ),

            // ── System ───────────────────────────────────────────────────────
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Resolve the display name of the person who would actually RECEIVE the
     * assistance.
     *
     * For self-filed requests, that's the citizen themselves — we read from
     * the request's identity SNAPSHOT, not the live beneficiary row, so the
     * value reflects who they were AT SUBMISSION TIME.
     *
     * For on-behalf-of filings (burial, or any other program where a
     * relative files for the actual beneficiary), the subject is recorded
     * in the on_behalf_* columns.
     */
    private function resolveSubjectFullName(): string
    {
        $parts = $this->relationship_to_beneficiary === null
            ? [
                $this->snapshot_first_name,
                $this->snapshot_middle_name,
                $this->snapshot_last_name,
                $this->snapshot_suffix,
            ]
            : [
                $this->on_behalf_first_name,
                $this->on_behalf_middle_name,
                $this->on_behalf_last_name,
                $this->on_behalf_suffix,
            ];

        return trim(implode(' ', array_filter($parts)));
    }
}
