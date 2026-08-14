<?php

namespace App\Core\Procurement\Repositories;

use App\Core\Procurement\Dto\ProcurementFilterDto;
use App\Core\Procurement\Dto\StoreProcurementsDto;
use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Models\Procurement;

class ProcurementsRepository
{
    public function save(StoreProcurementsDto $dto, string $procurementId)
    {

        return Procurement::create([

            'id' => $procurementId,

            'created_by' => $dto->createdBy,

            'municipal_id' => $dto->municipalId,

            'reference_number' => $dto->referenceNumber,

            'funding_source_id' => $dto->fundingSourceId,

            'custom_funding_source' => $dto->customFundingSource,

            'department_id' => $dto->departmentId,

            'title' => $dto->title,

            'description' => $dto->description,

            'category' => $dto->category,

            'status' => $dto->status,

            'abc_amount' => $dto->abcAmount,

            'contract_amount' => $dto->status === ProcurementStatus::AWARDED ? $dto->contractAmount : null,

            'winning_bidder_name' => $dto->status === ProcurementStatus::AWARDED ? $dto->winningBidder : null,

            'pre_bid_date' => $dto->preBidDate,

            'closing_date' => $dto->closingDate,

            'awarded_date' => $dto->status === ProcurementStatus::AWARDED ? $dto->awardDate : null,

            'failure_reason' => $dto->status === ProcurementStatus::FAILED ? $dto->failureReason : null,

            'failed_date' => $dto->status === ProcurementStatus::FAILED ? $dto->failedDate : null,

            'notes' => $dto->status === ProcurementStatus::CANCELLED ? $dto->notes : null,

        ]);

    }

    public function findByIdAndMunicipality(string $procurementId, string $municipalId)
    {

        return Procurement::where('municipal_id', $municipalId)
            ->with('media')
            ->with('department')
            ->with('fundingSource')
            ->with('creator')
            ->findOrFail($procurementId);

    }

    public function lockByIdAndMunicipality(string $procurementId, string $municipalId): Procurement
    {
        return Procurement::query()
            ->where('municipal_id', $municipalId)
            ->with(['media', 'department', 'fundingSource', 'creator'])
            ->lockForUpdate()
            ->findOrFail($procurementId);
    }

    public function getFilteredList(string $municipalId, ProcurementFilterDto $dto)
    {
        return Procurement::query()
            ->where('municipal_id', $municipalId)
            ->select([
                'id',
                'municipal_id',
                'reference_number',
                'title',
                'category',
                'status',
                'abc_amount',
                'closing_date',
                'created_at',
            ])

            ->when($dto->search, function ($query) use ($dto) {
                $query->where(function ($subQuery) use ($dto) {
                    $searchTerm = "%{$dto->search}%";
                    $subQuery->whereLike('title', $searchTerm, caseSensitive: false)
                        ->orWhereLike('reference_number', $searchTerm, caseSensitive: false)
                        ->orWhereLike('winning_bidder_name', $searchTerm, caseSensitive: false);
                });
            })
            ->when($dto->status, fn ($query) => $query->where('status', $dto->status->value))
            ->when($dto->category, fn ($query) => $query->where('category', $dto->category))
            ->when($dto->departmentId, fn ($query) => $query->where('department_id', $dto->departmentId))
            ->when($dto->fundingSourceId, fn ($query) => $query->where('funding_source_id', $dto->fundingSourceId))
            ->orderBy($dto->sortField, $dto->sortDirection)
            ->paginate(25)
            ->withQueryString();
    }

    public function deleteProcurement(Procurement $procurement): bool
    {
        return (bool) $procurement->delete();
    }

    /**
     * Transition a row that the caller has already locked inside a transaction.
     *
     * @param  array<string, mixed>  $attributes
     */
    public function transitionStatus(
        Procurement $procurement,
        ProcurementStatus|array $expectedStatuses,
        ProcurementStatus $newStatus,
        array $attributes = [],
    ): bool {
        $expectedStatuses = is_array($expectedStatuses) ? $expectedStatuses : [$expectedStatuses];

        if (! in_array($procurement->status, $expectedStatuses, true)) {
            throw new ProcurementDomainException(
                "Action Denied: Cannot move a procurement from '{$procurement->status->label()}' to '{$newStatus->label()}'."
            );
        }

        return $procurement->update([
            ...$attributes,
            'status' => $newStatus,
        ]);
    }
}
