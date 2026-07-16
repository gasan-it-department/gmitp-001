<?php

namespace App\External\Api\Resources\Cemetery\Reports;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CemeteryReportRowResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return $this->resource;
    }
}
