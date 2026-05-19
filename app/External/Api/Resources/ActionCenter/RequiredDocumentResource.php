<?php

namespace App\External\Api\Resources\ActionCenter;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Override;

class RequiredDocumentResource extends JsonResource
{
    #[Override]
    public function toArray(Request $request)
    {
        return [
            'key' => $this->key,
            'label' => $this->label,
            'description' => $this->description,
            'is_required' => (bool) $this->pivot->is_required,
            'sort_order' => (int) ($this->pivot->sort_order ?? 0),
        ];
    }
}