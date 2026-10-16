<?php

namespace App\External\Api\Resources\GoodsDistribution;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class BulkAdditionalIssueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->id, 'status' => $this->status->value, 'reason' => $this->reason, 'lines' => $this->lines_snapshot,
            'created_at' => $this->created_at->toIso8601String(), 'approved_on' => $this->approved_at?->toDateString(),
            'actual_issue_on' => $this->actual_issue_on?->toDateString(), 'cancellation_reason' => $this->cancellation_reason];
    }
}
