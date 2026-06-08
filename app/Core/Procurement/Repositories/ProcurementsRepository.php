<?php

namespace App\Core\Procurement\Repositories;

use App\Core\Procurement\Dto\ProcurementFilterDto;
use App\Core\Procurement\Dto\StoreProcurementsDto;
use App\Core\Procurement\Dto\UpdateProcurementDto;
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

            'category' => $dto->category,

            'status' => $dto->status,

            'abc_amount' => $dto->abcAmount,

            'contract_amount' => $dto->contractAmount,

            'winning_bidder_name' => $dto->winningBidder,

            'pre_bid_date' => $dto->preBidDate,

            'closing_date' => $dto->closingDate,

            'awarded_date' => $dto->awardDate,

            'notes' => $dto->notes,

        ]);

    }

    public function update(string $municipalId, string $procurementId, array $data): bool
    {

        $procurement = $this->findByIdAndMunicipality($procurementId, $municipalId);

        if (!$procurement) {
            return false;
        }

        return $procurement->update($data);

    }

    public function findById(string $id)
    {

        return Procurement::findOrFail($id);

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
                'created_at'
            ])

            ->when($dto->search, function ($query) use ($dto) {
                $query->where(function ($subQuery) use ($dto) {
                    $searchTerm = "%{$dto->search}%";
                    $subQuery->where('title', 'like', $searchTerm)
                        ->orWhere('reference_number', 'like', $searchTerm)
                        ->orWhere('winning_bidder_name', 'like', $searchTerm);
                });
            })
            ->when($dto->status, fn($query) => $query->where('status', $dto->status->value))
            ->when($dto->category, fn($query) => $query->where('category', $dto->category))
            ->when($dto->departmentId, fn($query) => $query->where('department_id', $dto->departmentId))
            ->when($dto->fundingSourceId, fn($query) => $query->where('funding_source_id', $dto->fundingSourceId))
            ->orderBy($dto->sortField, $dto->sortDirection)
            ->paginate(25)
            ->withQueryString();
    }

    public function deleteProcurement(string $procurementId): bool
    {
        return Procurement::where('id', $procurementId)->delete();
    }

    public function transitionStatus(string $procurementId, $newStatus, ?string $appendNotes = null): bool
    {
        $payload = [
            'status' => $newStatus,
        ];

        if ($appendNotes) {
            $payload['notes'] = $appendNotes;
        }
        return Procurement::where('id', $procurementId)->update($payload);
    }

}