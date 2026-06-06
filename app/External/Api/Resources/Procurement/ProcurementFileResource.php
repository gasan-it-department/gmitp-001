<?php

namespace App\External\Api\Resources\Procurement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcurementFileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        try {
            $url = $this->getUrl();
        } catch (\Exception $e) {
            $url = asset("storage/{$this->id}/{$this->file_name}");
        }

        return [
            'id' => $this->id,
            'name' => $this->file_name,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'url' => $url,
        ];
    }
}