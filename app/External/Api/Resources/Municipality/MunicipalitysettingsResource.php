<?php

namespace App\External\Api\Resources\Municipality;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
class MunicipalitysettingsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            // We expose the computed URL, not the raw public_id
            'logoUrl' => $this->logo_url,

            // add other settings

        ];
    }
}
