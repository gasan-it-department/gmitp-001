<?php

namespace App\External\Api\Resources\Cemetery;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DecedentListResource extends JsonResource
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
            // Format: LAST NAME, FIRST NAME MIDDLE NAME SUFFIX
            'full_name' => trim(sprintf(
                '%s, %s %s %s',
                $this->last_name,
                $this->first_name,
                $this->middle_name ?? '',
                $this->suffix ?? ''
            )),
            'death_certificate_no' => ($this->death_certificate_no !== null && $this->death_certificate_no !== '')
                ? $this->death_certificate_no
                : 'N/A',
            'date_of_death' => $this->date_of_death?->format('M d, Y') ?? 'N/A',
        ];

    }
}
