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
        $data = [
            // We expose the computed URL, not the raw public_id
            'id' => $this->id,

            'logoUrl' => $this->logo_secure_url,

            'helper_logo_link' => $this->logo_url,
            // add other settings

        ];


        return $data;
    }
}
