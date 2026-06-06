<?php

namespace App\External\Api\Resources\Department;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Lightweight dropdown payload for selecting a department.
 *
 * Shape: { id, label: "{code} - {name}", code, name }
 */
class DepartmentOptionsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => "{$this->code} - {$this->name}",
            'code' => $this->code,
            'name' => $this->name,
        ];
    }
}
