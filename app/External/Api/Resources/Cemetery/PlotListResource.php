<?php

namespace App\External\Api\Resources\Cemetery;

use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Enums\PlotTypes;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlotListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var PlotStatus|null $status */
        $status = $this->status;
        /** @var PlotTypes|null $type */
        $type = $this->type;

        return [
            'id' => $this->id,
            'plot_number' => $this->plot_number,
            'name' => $this->name,
            'type' => $type?->value,
            'type_label' => $type?->label(),
            'status' => $status?->value,
            'status_label' => $status?->label(),
            'status_tone' => $status?->tone(),
            'total_capacity' => $this->total_capacity,
            'section' => $this->whenLoaded('section', fn () => $this->section ? [
                'id' => $this->section->id,
                'name' => $this->section->name,
            ] : null),
        ];
    }
}
