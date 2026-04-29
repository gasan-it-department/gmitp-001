<?php

namespace App\External\Api\Resources\ActionCenter;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssistanceTypesResource extends JsonResource
{
    public function toArray(Request $request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'required_documents' => $this->required_documents,
        ];
    }
}