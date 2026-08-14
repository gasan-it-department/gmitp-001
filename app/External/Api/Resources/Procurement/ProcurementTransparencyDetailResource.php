<?php

namespace App\External\Api\Resources\Procurement;

use App\Core\Procurement\Enums\ProcurementCategory;
use App\Core\Procurement\Enums\ProcurementStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class ProcurementTransparencyDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var ProcurementStatus|null $status */
        $status = $this->status instanceof ProcurementStatus ? $this->status : null;
        /** @var ProcurementCategory|null $category */
        $category = $this->category instanceof ProcurementCategory ? $this->category : null;
        $isAwarded = $status === ProcurementStatus::AWARDED;
        $isFailed = $status === ProcurementStatus::FAILED;
        $isCancelled = $status === ProcurementStatus::CANCELLED;

        return [
            'id' => (string) $this->id,
            'reference_number' => $this->reference_number ?? 'Pending PhilGEPS',
            'title' => (string) $this->title,
            'description' => $this->description,
            'category' => $category?->value,
            'category_label' => $category?->label(),
            'status' => $status?->value,
            'status_label' => $status?->label(),
            'department_name' => $this->relationLoaded('department')
                ? $this->department?->name
                : null,
            'funding_source' => $this->fundingSourceLabel(),
            'abc_amount' => (float) $this->abc_amount,
            'published_at' => $this->published_at?->format('M d, Y'),
            'pre_bid_date' => $this->pre_bid_date?->format('M d, Y g:i A'),
            'closing_date' => $this->closing_date?->format('M d, Y g:i A'),
            'winning_bidder' => $isAwarded ? $this->winning_bidder_name : null,
            'contract_amount' => $isAwarded && $this->contract_amount !== null
                ? (float) $this->contract_amount
                : null,
            'awarded_date' => $isAwarded ? $this->awarded_date?->format('M d, Y') : null,
            'failure_reason' => $isFailed ? $this->failure_reason : null,
            'failed_date' => $isFailed ? $this->formatDateValue($this->failed_date) : null,
            'cancellation_reason' => $isCancelled ? $this->notes : null,
            'outcome_date' => $this->outcomeDate($status),
            'documents' => $this->relationLoaded('media')
                ? ProcurementFileResource::collection($this->media)
                : [],
        ];
    }

    private function fundingSourceLabel(): ?string
    {
        if (filled($this->custom_funding_source)) {
            return $this->custom_funding_source;
        }

        return $this->relationLoaded('fundingSource')
            ? $this->fundingSource?->name
            : null;
    }

    private function formatDateValue(mixed $value): ?string
    {
        return filled($value) ? Carbon::parse($value)->format('M d, Y') : null;
    }

    private function outcomeDate(?ProcurementStatus $status): ?string
    {
        return match ($status) {
            ProcurementStatus::AWARDED => $this->awarded_date?->format('M d, Y'),
            ProcurementStatus::FAILED => $this->formatDateValue($this->failed_date),
            default => null,
        };
    }
}
