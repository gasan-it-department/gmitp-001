<?php

namespace App\Core\ActionCenter\Requests\Repositories;

use App\Core\ActionCenter\Requests\Dto\AssistanceQueryDto;
use App\Core\ActionCenter\Requests\Enums\RequestStatus;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use App\Core\ActionCenter\Requests\Dto\CreateAssistanceDto;
use App\Core\ActionCenter\Requests\Models\AssistanceRequest;

class AssistanceRequestRepositories
{
    public function save(CreateAssistanceDto $dto, string $assistanceId, string $transactionNumber, string $municipalId, RequestStatus $status)
    {
        return AssistanceRequest::create([

            'id' => $assistanceId,

            'status' => $status,

            'transaction_number' => $transactionNumber,

            'assistance_type' => $dto->assistanceType,

            'description' => $dto->description,

            'assistance_beneficiary_id' => $dto->beneficiaryId,

            'user_id' => $dto->userId,

            'municipal_id' => $municipalId,

        ]);
    }

    public function getAllPerMunicipality(string $municipalId, AssistanceQueryDto $dto): LengthAwarePaginator
    {
        $assistance = AssistanceRequest::query()
            ->with('beneficiary')
            ->where('municipal_id', $municipalId)

            ->when(!empty($dto->search), function ($query) use ($dto) {
                $searchTerm = '%' . $dto->search . '%';

                $query->where(function ($q) use ($searchTerm) {
                    $q->where('transaction_number', 'like', $searchTerm)
                        ->orWhere('description', 'like', $searchTerm)

                        ->orWhereHas('beneficiary', function ($bQuery) use ($searchTerm) {
                            $bQuery->searchBeneficiary($searchTerm);
                        });
                });
            })

            ->when(!empty($dto->status), function ($query) use ($dto) {
                $query->where('status', $dto->status);
            })

            ->when(!empty($dto->assistanceType), function ($query) use ($dto) {
                $query->where('assistance_type', $dto->assistanceType);
            })

            ->orderBy($dto->orderBy, $dto->direction)
            ->paginate($dto->perPage)
            ->withQueryString();

        return $assistance;
    }

    public function findById(string $id): ?AssistanceRequest
    {

        return AssistanceRequest::find($id);

    }

    public function findOwnedRequest(string $userId, string $requesId)
    {

        return AssistanceRequest::where('id', $requesId)
            ->where('user_id', $userId)
            ->first();

    }

    public function findByIdWithBeneficiary(string $id)
    {

        return AssistanceRequest::with('beneficiary')->findOrFail($id);

    }

    public function getByUserId(string $userId)
    {

        return AssistanceRequest::query()
            ->where('user_id', $userId)
            ->latest()
            ->paginate(10);
    }

}