<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Dto\ProcurementFilterDto;
use App\Core\Procurement\Models\Procurement;

class ListPublishedProcurementsUseCase
{
    public function execute(string $municipalId, ProcurementFilterDto $dto)
    {
        return Procurement::query()
            // 1. TENANT SECURITY (Always first)
            ->where('municipal_id', $municipalId)

            ->select([
                'id',
                'municipal_id',
                'department_id',
                'funding_source_id',
                'custom_funding_source',
                'reference_number',
                'title',
                'description',
                'category',
                'status',
                'notes',
                'abc_amount',
                'published_at',
                'closing_date',
                'pre_bid_date',
                'winning_bidder_name',
                'contract_amount',
                'awarded_date',
                'failure_reason',
                'failed_date',
            ])

            // 2. THE IRON DOME: Force public visibility rules
            ->whereNotNull('published_at') // Must have a published date
            ->where('published_at', '<=', now()) // Prevents seeing future scheduled posts
            ->where('status', '!=', 'draft') // Double security: Never return drafts

            // 3. Eager load only relationships safe for the public contract.
            ->with([
                'department:id,name',
                'fundingSource:id,name,code',
            ])
            ->withCount('media as document_count')

            // 4. Apply the Public Filters (Omni-Search, Category, Status)
            ->when($dto->search, function ($query) use ($dto) {
                $query->where(function ($subQuery) use ($dto) {
                    $searchTerm = "%{$dto->search}%";
                    $subQuery->whereLike('title', $searchTerm, caseSensitive: false)
                        ->orWhereLike('reference_number', $searchTerm, caseSensitive: false)
                        ->orWhereLike('winning_bidder_name', $searchTerm, caseSensitive: false)
                        ->orWhereLike('custom_funding_source', $searchTerm, caseSensitive: false)
                        ->orWhereHas('department', fn ($department) => $department
                            ->whereLike('name', $searchTerm, caseSensitive: false))
                        ->orWhereHas('fundingSource', fn ($fundingSource) => $fundingSource
                            ->where(function ($fundingQuery) use ($searchTerm) {
                                $fundingQuery->whereLike('name', $searchTerm, caseSensitive: false)
                                    ->orWhereLike('code', $searchTerm, caseSensitive: false);
                            }));
                });
            })
            ->when($dto->status, fn ($query) => $query->where('status', $dto->status->value))
            ->when($dto->category, fn ($query) => $query->where('category', $dto->category))
            ->when($dto->departmentId, fn ($query) => $query->where('department_id', $dto->departmentId))
            ->when($dto->fundingSourceId, fn ($query) => $query->where('funding_source_id', $dto->fundingSourceId))

            // 5. Public sorting is usually latest published first
            ->latest('published_at')

            ->paginate(10)
            ->withQueryString();
    }
}
