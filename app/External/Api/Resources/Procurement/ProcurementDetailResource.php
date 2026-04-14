<?php

namespace App\External\Api\Resources\Procurement;

use App\External\Api\Resources\Department\DepartmentResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProcurementDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'created_at' => $this->created_at,
            'title' => $this->title,
            'reference_number' => $this->reference_number,

            'status' => $this->status?->value ?? $this->status,

            'abc_amount' => (float) $this->abc_amount,
            'contract_amount' => $this->contract_amount ? (float) $this->contract_amount : null,

            'winning_bidder' => $this->winning_bidder_name,
            'notes' => $this->notes,

            'pre_bid_date' => $this->pre_bid_date?->toIso8601String(),
            'closing_date' => $this->closing_date?->toIso8601String(),
            'awarded_date' => $this->awarded_date?->toIso8601String(),

            // --- RELATIONSHIPS ---
            'department' => $this->whenLoaded('department', fn() => new DepartmentResource($this->department)),

            'funding_source' => $this->whenLoaded('fundingSource', fn() => new ProcurementFundingSourceResource($this->fundingSource)),

            'category' => $this->category ? [
                'value' => $this->category->value,
                'label' => $this->category->label(),
            ] : null,

            'prepared_by' => $this->whenLoaded('creator', function () {
                if (!$this->creator)
                    return null;
                return [
                    'id' => $this->creator->id,
                    'full_name' => $this->creator->full_name,
                ];
            }),

            'documents' => $this->whenLoaded('documents', function () {

                $municipality = app('current_municipality');
                return $this->documents->map(function ($doc) use ($municipality) {
                    return [
                        'id' => $doc->id,
                        'file_name' => $doc->file_name,
                        'type' => $doc->type?->value ?? $doc->type,
                        'file_size' => (int) $doc->file_size,

                        'file_path' => route('procurement.download.document', [
                            'documentId' => $doc->id,
                            'municipality' => $municipality->slug, // Or however you access the slug in the resource
                        ]),
                    ];
                });
            }, []),
        ];
    }
}