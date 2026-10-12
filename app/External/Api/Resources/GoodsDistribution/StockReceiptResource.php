<?php

namespace App\External\Api\Resources\GoodsDistribution;

use App\Core\GoodsDistribution\Services\ReceiptFingerprintService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

final class StockReceiptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $programs = $this->relationLoaded('lines') ? $this->lines->map(fn ($line) => [
            'id' => $line->program_id,
            'name' => $line->program_id === null ? 'Unassigned' : ($this->status === 'draft' ? ($line->program?->name ?? $line->program_name_snapshot) : $line->program_name_snapshot),
        ])->unique('id')->values()->all() : [];
        if ($this->relationLoaded('lines')) {
            $this->lines->each(fn ($line) => $line->setAttribute('receipt_status', $this->status));
        }

        return [
            'programs' => $programs, 'is_mixed_program' => count($programs) > 1,
            ...$this->resource->only(['id', 'receipt_number', 'kind', 'status', 'stock_source_id', 'storage_location_id', 'reference', 'notes', 'lines_count', 'void_reason']),
            'source_name' => $this->status === 'draft' && $this->relationLoaded('source') ? $this->source->name : $this->source_name_snapshot,
            'location_name' => $this->status === 'draft' && $this->relationLoaded('location') ? $this->location->name : $this->storage_location_name_snapshot,
            'received_on' => $this->received_on->toDateString(), 'posted_at' => $this->posted_at?->toIso8601String(), 'voided_at' => $this->voided_at?->toIso8601String(),
            'created_by' => $this->whenLoaded('createdBy', fn () => $this->name($this->createdBy)),
            'posted_by' => $this->whenLoaded('postedBy', fn () => $this->name($this->postedBy)),
            'voided_by' => $this->whenLoaded('voidedBy', fn () => $this->name($this->voidedBy)),
            'draft_fingerprint' => $this->status === 'draft' && $this->relationLoaded('lines') ? app(ReceiptFingerprintService::class)->make($this->resource) : null,
            'lines' => $this->whenLoaded('lines', fn () => StockReceiptLineResource::collection($this->lines)->resolve($request)),
        ];
    }

    private function name(mixed $user): ?string
    {
        return $user ? trim($user->first_name.' '.$user->last_name) : null;
    }
}
