<?php

namespace App\External\Api\Resources\Cemetery\Sites;

use App\Core\Cemetery\Enums\CemeterySiteStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CemeterySiteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var CemeterySiteStatus $status */
        $status = $this->status;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'psgc_barangay_code' => $this->psgc_barangay_code,
            'barangay_name' => $this->barangay_name,
            'street_name' => $this->street_name,
            'status' => $status->value,
            'status_label' => $status->label(),
            'notes' => $this->notes,
            'sections_count' => $this->whenCounted('sections'),
        ];
    }
}
