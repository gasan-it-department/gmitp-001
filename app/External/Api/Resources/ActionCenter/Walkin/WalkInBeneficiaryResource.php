<?php

namespace App\External\Api\Resources\ActionCenter\Walkin;

use App\Core\ActionCenter\Enums\Sex;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Compact representation of a beneficiary surfaced as a POSSIBLE DUPLICATE when
 * an admin tries to encode a walk-in whose name + birth date already exist in
 * the municipality.
 *
 * Carries just enough for the admin to recognise the person and decide — plus
 * the id, so the UI can deep-link to the full profile page for a closer look
 * before choosing "this is a different person — register anyway".
 *
 * @property-read \App\Core\ActionCenter\Models\Beneficiary $resource
 */
class WalkInBeneficiaryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'full_name'    => trim($this->full_name),
            'first_name'    => $this->first_name,
            'middle_name'   => $this->middle_name,
            'last_name'     => $this->last_name,
            'suffix'        => $this->suffix,
            'sex'           => $this->sex,
            'sex_label'     => $this->sex ? Sex::tryFrom($this->sex)?->label() : null,
            'birth_date'    => $this->birth_date?->toDateString(),
            'age'           => $this->birth_date ? (int) $this->birth_date->age : null,
            'barangay'      => $this->whenLoaded('household', fn () => $this->household?->barangay),
            // Walk-in vs. linked online account — a linked match is almost
            // certainly the same person, so flag it prominently in the UI.
            'has_account'   => $this->user_id !== null,
            'account_email' => $this->whenLoaded('user', fn () => $this->user?->email),
        ];
    }
}
