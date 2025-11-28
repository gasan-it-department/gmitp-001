<?php

namespace App\Core\ActionCenter\Requests\Repositories;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use App\Core\ActionCenter\Requests\Dto\CreateAssistanceDto;
use App\Core\ActionCenter\Requests\Models\AssistanceRequest;

class AssistanceRequestRepositories
{
    public function save(CreateAssistanceDto $dto, string $assistanceId, string $transactionNumber, string $municipalId)
    {
        return AssistanceRequest::create([

            'id' => $assistanceId,

            'transaction_number' => $transactionNumber,

            'assistance_type' => $dto->assistanceType,

            'description' => $dto->description,

            'beneficiary_id' => $dto->beneficiaryId,

            'user_id' => $dto->userId,

            'municipal_id' => $municipalId,

        ]);
    }

    public function getAll(string $municipalId): LengthAwarePaginator
    {

        $assistance = AssistanceRequest::with('beneficiary')
            ->where('municipal_id', $municipalId)
            ->paginate(10);

        return $assistance;

    }
}