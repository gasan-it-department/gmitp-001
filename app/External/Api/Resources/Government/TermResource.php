<?php

namespace App\External\Api\Resources\Government;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TermResource extends JsonResource
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

            'name' => $this->name,

            'statutory_start' => $this->statutory_start,

            'statutory_end' => $this->statutory_end,

            'label' => $this->name . ($this->is_current ? ' (Current)' : '')

        ];

    }
}
