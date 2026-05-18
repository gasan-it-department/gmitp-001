<?php

namespace App\External\Api\Resources\ActionCenter;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Serialises one ac_household_members row for the Apply form's family-member
 * picker. Only the fields the picker needs to render and auto-fill the
 * on_behalf_* form values are exposed.
 */
class HouseholdMemberOptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'first_name'   => $this->first_name,
            'middle_name'  => $this->middle_name,
            'last_name'    => $this->last_name,
            'suffix'       => $this->suffix,
            'relationship' => $this->relationship,
            'birth_date'   => $this->birth_date?->toDateString(),
        ];
    }
}
