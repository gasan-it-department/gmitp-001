<?php

namespace App\External\Api\Resources\ActionCenter\Beneficiary;

use App\Core\ActionCenter\Enums\Sex;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Full beneficiary identity for the admin review (profile) page.
 *
 * This is the LIVE record — current name, civil status, income, household
 * address and linked account. The frozen-at-submission view lives on the
 * assistance request's snapshot_* columns; this resource intentionally shows
 * the present truth so the reviewer can verify it against the uploaded ID.
 *
 * Household members and assistance history are passed as their own props by
 * the controller (HouseholdMemberDetailsResource / RecentAssistanceRequestResource).
 */
class BeneficiaryProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            // ── Identity ─────────────────────────────────────────────────────
            'id' => $this->id,
            'beneficiary_number' => $this->beneficiary_number,
            'avatar_url' => $this->avatarUrl($request),
            'full_name' => $this->full_name,
            'first_name' => $this->first_name,
            'middle_name' => $this->middle_name,
            'last_name' => $this->last_name,
            'suffix' => $this->suffix,

            'sex' => $this->sex,
            'sex_label' => $this->sex ? Sex::tryFrom($this->sex)?->label() : null,

            'birth_date' => $this->birth_date?->toDateString(),
            'age' => $this->birth_date ? (int) $this->birth_date->age : null,

            'educational_attainment' => $this->educational_attainment,
            'religion' => $this->whenLoaded('religion', fn () => $this->religion?->name),
            // Raw FK so the admin edit form can pre-select the religion dropdown
            // (the human-readable name above is for read-only display).
            'religion_id' => $this->religion_id,

            // ── Economic snapshot (indigency cues) ───────────────────────────
            'civil_status' => $this->civil_status?->value,
            'civil_status_label' => $this->civil_status?->label(),
            'occupation' => $this->occupation,
            'monthly_income' => $this->monthly_income !== null ? (float) $this->monthly_income : null,

            // ── Household address ────────────────────────────────────────────
            'household' => $this->whenLoaded('household', fn () => [
                'id' => $this->household?->id,
                'household_code' => $this->household?->household_code,
                'barangay' => $this->household?->barangay,
                'street' => $this->household?->street,
            ]),

            // ── Linked portal account ────────────────────────────────────────
            'has_account' => $this->user_id !== null,
            'account_email' => $this->whenLoaded('user', fn () => $this->user?->email),

            // ── Registration / consent ───────────────────────────────────────
            'terms_consented_at' => $this->terms_consented_at?->toIso8601String(),
            'registered_at' => $this->created_at?->toIso8601String(),
            'identity_verified_at' => $this->identity_verified_at?->toIso8601String(),
            'identity_verified' => $this->identity_verified_at !== null,
            'identity_verified_by' => $this->whenLoaded(
                'identityVerifier',
                fn () => $this->identityVerifier
                    ? trim("{$this->identityVerifier->first_name} {$this->identityVerifier->last_name}")
                    : null,
            ),
        ];
    }

    /**
     * Authenticated stream URL for the profile photo, or null when none is set.
     * Uses the {municipality} slug from the current route (present on the admin
     * profile / edit / search routes). Appends `?v={timestamp}` so the browser
     * refetches after a re-upload (the base URL is otherwise static per id).
     */
    private function avatarUrl(Request $request): ?string
    {
        $municipality = $request->route('municipality');

        if (! $municipality) {
            return null;
        }

        $media = $this->getFirstMedia('avatar');

        if ($media === null) {
            return null;
        }

        return route('actionCenter.admin.beneficiary.avatar', [
            'municipality' => $municipality,
            'beneficiaryId' => $this->id,
            'v' => $media->updated_at?->timestamp,
        ]);
    }
}
