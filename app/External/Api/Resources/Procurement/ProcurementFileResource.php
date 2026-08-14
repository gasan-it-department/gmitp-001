<?php

namespace App\External\Api\Resources\Procurement;

use App\Core\Procurement\Enums\ProcurementDocumentType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcurementFileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $docType = ProcurementDocumentType::tryFrom($this->collection_name);
        $municipality = app('current_municipality');
        $isPublicRequest = $request->routeIs('transparency.*');
        $routeName = $isPublicRequest
            ? 'transparency.document'
            : 'procurement.admin.document';
        $url = route($routeName, [
            'municipality' => $municipality->slug,
            'procurementId' => $this->model_id,
            'mediaId' => $this->id,
        ]);

        return [
            'id' => $this->id,
            'name' => $this->file_name,
            'file_name' => $this->file_name,
            'mime_type' => $this->mime_type,
            'size' => (int) $this->size,
            'url' => $url,
            'download_url' => $url,
            'type' => $this->collection_name,
            'type_label' => $docType ? $docType->label() : 'Document',
        ];
    }
}
