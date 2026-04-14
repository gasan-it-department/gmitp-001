<?php

namespace App\External\Api\Resources\Department;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, // The ULID used for the select value
            'label' => "{$this->code} - {$this->name}", // e.g., "MEO - Municipal Engineering Office"
            'code' => $this->code,
            'name' => $this->name,
        ];
    }
}
