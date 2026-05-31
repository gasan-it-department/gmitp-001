<?php

namespace App\External\Api\Resources\Municipality;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HotlineResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'     => $this->id,
            'name'   => $this->name,
            'number' => $this->number,

            'category' => [
                'value' => $this->category->value,
                'label' => $this->category->label(),
            ],

            'is_active'  => (bool) $this->is_active,
            'sort_order' => (int) $this->sort_order,

            'created_at' => $this->created_at?->format('M d, Y g:i A'),
            'updated_at' => $this->updated_at?->format('M d, Y g:i A'),
        ];
    }
}
