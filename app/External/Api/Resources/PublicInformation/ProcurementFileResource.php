<?php

namespace App\External\Api\Resources\PublicInformation;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcurementFileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $cloudName = config('cloudinary.cloud_name');

        $resourceType = $this->resource_type;

        $baseUrl = "https://res.cloudinary.com/{$cloudName}/{$resourceType}/upload";

        $extension = pathinfo($this->file_name, PATHINFO_EXTENSION);

        $publicId = $this->public_id;

        return [

            'id' => $this->id,

            'name' => $this->file_name,

            'type' => $this->type,

            'view_url' => "{$baseUrl}/{$publicId}.{$extension}",

            'download_url' => "{$baseUrl}/fl_attachment/{$publicId}.{$extension}",
        ];
    }
}