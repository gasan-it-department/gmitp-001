<?php

namespace App\External\Api\Resources\CommunityReport;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommunityReportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [

            'id' => $this->id,

            'type' => $this->type,

            'sender_name' => $this->sender_name,

            'description' => $this->description,

            'latitude' => $this->latitude,

            'longitude' => $this->longitude,

            'status' => $this->status,

            'contact' => $this->contact,

            'location' => $this->location,

            'created_at' => $this->created_at,

            'resolved_at' => $this->resolved_at,

            'attachments' => $this->whenLoaded('attachments', function () {
                return CommunityReportFileResource::collection($this->attachments)->resolve();
            }),

        ];

        return $data;
    }
}
