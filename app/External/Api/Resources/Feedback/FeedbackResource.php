<?php

namespace App\External\Api\Resources\Feedback;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeedbackResource extends JsonResource
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

            'message' => $this->message,

            'feedback_target' => $this->feedback_target,

            'department_id' => $this->department_id,

            'rating' => $this->rating,

            'sender_name' => $this->sender_name,

            'employee_name' => $this->employee_name,

            'created_at' => $this->created_at,

            'attachments' => $this->whenLoaded('attachments', function () {

                return FeedbackFileResource::collection($this->attachments)->resolve();

            }),
        ];
    }
}
