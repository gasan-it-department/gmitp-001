<?php

namespace App\External\Api\Resources\Facility;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FacilityBaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $image = $this->getFirstMedia('facility_image');

        return [
            'id' => $this->id, 'name' => $this->name,
            'type' => ['value' => $this->type->value, 'label' => $this->type->label()],
            'location_name' => $this->location_name,
            'address' => $this->address,
            'image_url' => $image ? ($image->disk === 's3' ? $image->getTemporaryUrl(now()->addMinutes(15)) : $image->getUrl()) : null,
            'availability' => $this->availability,
        ];
    }

    protected function periods($periods): array
    {
        return $periods->map(fn ($period) => $period->only(['opening_minute', 'closing_minute']))->values()->all();
    }
}
