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

            // 2. THE IRON DOME: Force public visibility rules
            ->whereNotNull('published_at') // Must have a published date
            ->where('published_at', '<=', now()) // Prevents seeing future scheduled posts
            ->where('status', '!=', 'draft') // Double security: Never return drafts

            // 3. Eager load safe relationships (Public needs to know the department)
            ->with(['department:id,name', 'media'])

            // 4. Apply the Public Filters (Omni-Search, Category, Status)
            ->when($dto->search, function ($query) use ($dto) {
                $query->where(function ($subQuery) use ($dto) {
                    $searchTerm = "%{$dto->search}%";
                    $subQuery->where('title', 'like', $searchTerm)
                        ->orWhere('reference_number', 'like', $searchTerm);
                });
            })
            ->when($dto->status, fn($query) => $query->where('status', $dto->status->value))
            ->when($dto->category, fn($query) => $query->where('category', $dto->category))

            // 5. Public sorting is usually latest published first
            ->latest('published_at')

            ->paginate(10)
            ->withQueryString();
    }
}