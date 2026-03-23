<?php

namespace App\External\Api\Resources\Cemetery;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DecedentDetailsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'middle_name' => $this->middle_name,
            'suffix' => $this->suffix,
            'memorial_name' => $this->memorial_name,
            'date_of_birth' => $this->date_of_birth,
            'date_of_death' => $this->date_of_death,
            'date_of_registration' => $this->date_of_registration,
            'decedent_type' => $this->decedent_type,
            'reference_document_type' => $this->reference_document_type,
            'reference_document_number' => $this->reference_document_number,
            'place_of_death' => $this->place_of_death,
            'gender' => $this->gender,
            'cause_of_death' => $this->cause_of_death,
            'death_certificate_no' => $this->death_certificate_no,
            'notes' => $this->notes,
            'address_id' => $this->address_id,
        ];
    }
}
