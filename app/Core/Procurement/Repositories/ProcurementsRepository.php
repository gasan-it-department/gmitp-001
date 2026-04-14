<?php

namespace App\Core\Procurement\Repositories;

use App\Core\Procurement\Dto\StoreProcurementsDto;
use App\Core\Procurement\Dto\UpdateProcurementDto;
use App\Core\Procurement\Models\Procurement;
use App\Core\Procurement\Models\ProcurementDocument;

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

    public function saveFiles(array $fileData, string $procurementId, string $type, string $fileId, string $uploadedBy)
    {

        ProcurementDocument::create([

            'id' => $fileId,

            'uploaded_by' => $uploadedBy,

            'procurement_id' => $procurementId,

            'file_path' => $fileData['file_path'],

            'file_name' => $fileData['original_name'],

            'file_size' => $fileData['file_size'],

            'type' => $type,

            'mime_type' => $fileData['mime_type'],

        ]);

    }

    public function findById(string $id)
    {

        return Procurement::findOrFail($id);

    }

    public function findByIdAndMunicipality(string $procurementId, string $municipalId)
    {

        return Procurement::where('municipal_id', $municipalId)
            ->with('documents')
            ->with('department')
            ->with('fundingSource')
            ->with('creator')
            ->findOrFail($procurementId);

    }

    public function paginateByMunicipality(string $municipalId)
    {

        return Procurement::query()
            ->where('municipal_id', $municipalId)
            ->with('documents')
            ->with('department')
            ->paginate(10);

    }

    public function getDocumentCount(string $procurementId, string $municipalId): int
    {
        $procurement = Procurement::where('id', $procurementId)
            ->where('municipal_id', $municipalId) // Always check the municipality for security!
            ->withCount('documents')
            ->first();

        // If procurement exists, return the count. Otherwise, return 0.
        return $procurement ? $procurement->documents_count : 0;
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