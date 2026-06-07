<?php

namespace App\External\Api\Resources\ActionCenter\Beneficiary;

use App\Core\ActionCenter\Enums\Sex;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

/**
 * Row-level payload for the admin beneficiary-search results.
 *
 * Built to show the interviewer EVERYTHING they need to verify identity
 * against the uploaded government ID in one glance: full identity, address,
 * economic snapshot, linked account, and the assistance-history summary that
 * flags a recent payout.
 *
 * The *_count / last_*_at attributes are produced by SearchBeneficiaryAction
 * (withCount + subquery selects), not by relations, so they are read straight
 * off the model rather than via whenLoaded().
 */
class BeneficiaryListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            // ── Identity ─────────────────────────────────────────────────────
            'id'                 => $this->id,
            'beneficiary_number' => $this->beneficiary_number,
            'full_name'   => $this->full_name,   // getFullNameAttribute() accessor
            'first_name'  => $this->first_name,
            'middle_name' => $this->middle_name,
            'last_name'   => $this->last_name,
            'suffix'      => $this->suffix,

            'sex'       => $this->sex,
            'sex_label' => $this->sex ? Sex::tryFrom($this->sex)?->label() : null,

            'birth_date' => $this->birth_date?->toDateString(),
            'age'        => $this->birth_date ? (int) $this->birth_date->age : null,

            // ── Economic snapshot (indigency cues) ───────────────────────────
            'civil_status'       => $this->civil_status?->value,
            'civil_status_label' => $this->civil_status?->label(),
            'occupation'         => $this->occupation,
            'monthly_income'     => $this->monthly_income !== null
                ? (float) $this->monthly_income
                : null,

            // ── Address (household) ──────────────────────────────────────────
            'barangay' => $this->whenLoaded('household', fn () => $this->household?->barangay),
            'street'   => $this->whenLoaded('household', fn () => $this->household?->street),

            // ── Linked portal account ────────────────────────────────────────
            // has_account = false → walk-in encoded by an admin (no login).
            'has_account'   => $this->user_id !== null,
            'account_email' => $this->whenLoaded('user', fn () => $this->user?->email),

            // ── Assistance-history summary (duplicate / recency signal) ──────
            'total_requests'  => (int) ($this->total_requests_count ?? 0),
            'released_count'  => (int) ($this->released_count ?? 0),
            'last_released_at' => $this->last_released_at
                ? Carbon::parse($this->last_released_at)->toIso8601String()
                : null,
            'last_request_at' => $this->last_request_at
                ? Carbon::parse($this->last_request_at)->toIso8601String()
                : null,
        ];
    }
}
