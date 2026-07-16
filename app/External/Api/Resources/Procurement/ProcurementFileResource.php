<?php

namespace App\External\Api\Resources\Procurement;

use App\Core\Procurement\Enums\ProcurementDocumentType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcurementFileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $url = str_starts_with($this->disk, 's3')
            ? $this->getTemporaryUrl(now()->addHour())
            : $this->getUrl();

        $docType = ProcurementDocumentType::tryFrom($this->collection_name);

        return [
            'id' => $this->id,
            'name' => $this->file_name,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'url' => $url,
            'type' => $this->collection_name,
            'type_label' => $docType ? $docType->label() : 'Document',
        ];
    }
}