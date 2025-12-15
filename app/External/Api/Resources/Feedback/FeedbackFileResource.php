<?php

namespace App\External\Api\Resources\Feedback;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeedbackFileResource extends JsonResource
{

    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,

            'public_url' => $this->public_url,

            'file_type' => $this->file_type

        ];
    }

}