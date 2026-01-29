<?php

namespace App\Core\PublicInformation\Repositories;

use App\Core\PublicInformation\Dto\StoreProcurementsDto;
use App\Core\PublicInformation\Models\Procurement;
use App\Core\PublicInformation\Models\ProcurementFile;

class ProcurementsRepository
{

    public function save(StoreProcurementsDto $dto, string $procurementId)
    {

        return Procurement::create([

            'id' => $procurementId,

            'user_id' => $dto->userId,

            'municipal_id' => $dto->municipalId,

            'reference_number' => $dto->referenceNumber,

            'title' => $dto->title,

            'category' => $dto->category,

            'status' => $dto->status,

            'approved_budget' => $dto->approvedBudget,

            'contract_amount' => $dto->contractAmount,

            'winning_bidder' => $dto->winningBidder,

            'pre_bid_date' => $dto->preBidDate,

            'closing_date' => $dto->closingDate,

            'award_date' => $dto->awardDate,

        ]);

    }

    public function saveFiles(array $fileData, string $procurementId, string $type, string $fileId)
    {

        ProcurementFile::create([

            'id' => $fileId,

            'procurement_id' => $procurementId,

            'public_id' => $fileData['public_id'],

            'file_name' => $fileData['original_name'],

            'type' => $type,

            'resource_type' => $fileData['resource_type'] ?? 'image',

        ]);

    }

    public function findById(string $id)
    {

        return Procurement::findOrFail($id);

    }

    public function findByIdAndMunicipality(string $procurementId, string $municipalId)
    {

        return Procurement::with('files')
            ->where('municipal_id', $municipalId)
            ->find($procurementId);

    }

    public function getAllPermunicipality(string $municipalId)
    {

        return Procurement::query()
            ->where('municipal_id', $municipalId)
            ->with('files')
            ->paginate(50);

    }

}