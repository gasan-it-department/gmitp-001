<?php

namespace App\Core\ActionCenter\Infrastructures\Repositories;

use App\Core\ActionCenter\Applications\Dto\AssistanceRequestDto;
use App\Core\ActionCenter\Applications\Dto\BeneficiaryDto;
use App\Core\ActionCenter\Infrastructures\Models\AssistanceRequest;
use App\Core\ActionCenter\Infrastructures\Models\Beneficiary;
class AssistanceRequestRepositories
{
    public function save(AssistanceRequestDto $request, BeneficiaryDto $beneficiaryDto)
    {
        Beneficiary::create([
            'id' => $beneficiaryDto->id,
            'first_name' => $beneficiaryDto->firstName,
            'middle_name' => $beneficiaryDto->middleName,
            'last_name' => $beneficiaryDto->lastName,
            'suffix' => $beneficiaryDto->suffix,
            'birth_date' => $beneficiaryDto->birthDate,
            'contact_number' => $beneficiaryDto->contactNumber,
            'province' => $beneficiaryDto->province,
            'municipality' => $beneficiaryDto->municipality,
            'barangay' => $beneficiaryDto->barangay,
        ]);

        AssistanceRequest::create([
            'id' => $request->id,
            'transaction_number' => $request->transactionNumber,
            'assistance_type' => $request->assistanceType,
            'description' => $request->description,
            'beneficiary_id' => $beneficiaryDto->id,
            'status' => $request->status,
            'user_id' => $request->userId,
        ]);

    }

    public function findOrFail(string $id)
    {
        $request = AssistanceRequest::with('beneficiary')->find($id);
        if (!$request) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException("Assistance request {$id} not found");
        }
        return $request;
    }

    public function update(AssistanceRequestDto $request, ?BeneficiaryDto $beneficiaryDto = null)
    {
        $assistance = AssistanceRequest::findOrFail($request->id);
        $assistance->update([
            'assistance_type' => $request->assistanceType,
            'description' => $request->description,
            'status' => $request->status,
        ]);

        if ($beneficiaryDto) {
            $beneficiary = Beneficiary::findOrFail($assistance->beneficiary_id);
            $beneficiary->update([
                'first_name' => $beneficiaryDto->firstName,
                'middle_name' => $beneficiaryDto->middleName,
                'last_name' => $beneficiaryDto->lastName,
                'suffix' => $beneficiaryDto->suffix,
                'birth_date' => $beneficiaryDto->birthDate,
                'contact_number' => $beneficiaryDto->contactNumber,
                'province' => $beneficiaryDto->province,
                'municipality' => $beneficiaryDto->municipality,
                'barangay' => $beneficiaryDto->barangay,
            ]);
        }
    }

    public function delete(string $id)
    {
        $request = AssistanceRequest::findOrFail($id);
        $request->delete();
    }

    public function getAll()
    {

    }
}