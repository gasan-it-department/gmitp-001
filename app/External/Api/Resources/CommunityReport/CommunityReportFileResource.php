<?php

namespace App\External\Api\Resources\CommunityReport;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommunityReportFileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {


        $cloudName = config('cloudinary.cloud_name');

        $resourceType = $this->resource_type;

        $baseUrl = "https://res.cloudinary.com/{$cloudName}/{$resourceType}/upload";

        $extension = pathinfo($this->original_name, PATHINFO_EXTENSION);

        $publicId = $this->public_id;

        $viewTransformation = ($resourceType === 'image') ? "/f_auto,q_auto" : "";

        return [

            'id' => $this->id,

            'name' => $this->original_name,

            'type' => $this->mime_type,

            'view_url' => "{$baseUrl}{$viewTransformation}/{$publicId}.{$extension}",

            'download_url' => "{$baseUrl}/fl_attachment/{$publicId}.{$extension}",

        ];

    }
}
