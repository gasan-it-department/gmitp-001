<?php
namespace App\External\Api\Resources\Government;

use App\External\Api\Resources\Government\OfficialResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\MissingValue;

class PublicRosterResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // 1. Grab the appointments collection that the UseCase eager-loaded
        $appointments = $this->whenLoaded('appointments');

        // 2. Safely extract the human (Official) from the first appointment
        $official = null;
        if (!$appointments instanceof MissingValue && $appointments->isNotEmpty()) {
            $official = $appointments->first()->official;
        }

        // 3. Build the perfectly flat array for React
        return [
            'id' => $this->id,
            'title' => $this->title,
            'category' => $this->category,
            'sequence' => $this->sequence,
            // We pass the extracted $official variable here, NOT whenLoaded()
            'official' => $official ? new OfficialResource($official) : null,
        ];
    }
}