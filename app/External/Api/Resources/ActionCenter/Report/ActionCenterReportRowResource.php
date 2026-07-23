<?php

namespace App\External\Api\Resources\ActionCenter\Report;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActionCenterReportRowResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return $this->resource;
    }
}
