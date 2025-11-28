<?php

namespace App\External\Api\Controllers\ActionCenter;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Core\ActionCenter\Requests\Services\StatusList;
use App\Core\ActionCenter\Requests\Dto\CreateAssistanceDto;
use App\External\Api\Request\ActionCenter\AssistanceRequest;
use App\External\Api\Request\ActionCenter\BeneficiaryRequest;
use App\Core\ActionCenter\Requests\Services\AssistanceTypesList;
use App\Core\ActionCenter\Beneficiaries\Dto\CreateBeneficiaryDto;
use App\Core\ActionCenter\Applications\Services\CreateAssistanceRequest;
use App\Core\ActionCenter\Applications\Services\UpdateAssistanceRequest;
use App\Core\ActionCenter\Beneficiaries\UseCase\CreateBeneficiaryUseCase;
use App\Core\ActionCenter\Requests\UseCase\CreateAssistanceRequestUseCase;
use App\Core\ActionCenter\Requests\UseCase\GetAllAssistancePerMunicipality;
use App\Core\ActionCenter\Infrastructures\Repositories\AssistanceRequestRepositories;

class ActionCenterController extends Controller
{

    public function __construct(

        private CreateBeneficiaryUseCase $createBeneficiary,

        private CreateAssistanceRequestUseCase $createAssistance,

        private GetAllAssistancePerMunicipality $getAllAssistance,

        private AssistanceTypesList $assistanceTypesList


    ) {
    }


    public function store(AssistanceRequest $assistance, BeneficiaryRequest $beneficiary)
    {

        $validatedAssistance = $assistance->validated();

        $validatedBeneficiary = $beneficiary->validated();

        $userId = auth()->id();

        $municipalId = app('municipal_id');

        $beneficiaryDto = new CreateBeneficiaryDto(

            $validatedBeneficiary['first_name'],

            $validatedBeneficiary['last_name'],

            $validatedBeneficiary['middle_name'],

            $validatedBeneficiary['suffix'],

            $validatedBeneficiary['birth_date'],

            $validatedBeneficiary['contact_number'],

            $validatedBeneficiary['province'],

            $validatedBeneficiary['municipality'],

            $validatedBeneficiary['barangay'],

        );

        $beneficiary = $this->createBeneficiary->execute($beneficiaryDto);

        $assistanceDto = new CreateAssistanceDto(

            $validatedAssistance['assistance_type'],

            $validatedAssistance['description'],

            $userId,

            $beneficiary->id,

        );

        $assistance = $this->createAssistance->execute($assistanceDto, $municipalId);

        return response()->json([

            'message' => 'request created',
            'success' => true,
            'data' => [
                'assistance' => $assistance, 
                'beneficiary' => $beneficiary
            ],

        ], 200);

    }

    public function fetch()
    {
        $municipalId = app('municipal_id');

        $assitance = $this->getAllAssistance->execute($municipalId);

        return response()->json([

            'success' => true,
            'data' => $assitance,

        ], 200);

    }

    public function show($id)
    {
        // Example: find request by ID
        // $requestModel = RequestModel::findOrFail($id);

        return response()->json(['message' => "Showing request {$id}"], 200);
    }

    public function update(Request $request, string $id)
    {

        return response()->json([
            'success' => true,
            'message' => "Request {$id} updated successfully",
        ], 200);
    }

    public function deleteRequest($id)
    {
        $request = AssistanceRequest::findOrFail($id);
        $request->delete();
        return response()->json([
            'success' => true,
            'message' => 'Deleted successfully'
        ], 200);
    }

    public function destroy($id)
    {
        try {
            // Find the assistance request
            $request = AssistanceRequest::findOrFail($id);

            // Delete the related beneficiary first
            $request->beneficiary()->delete();

            // Delete the request itself
            $request->delete();

            return response()->json(['message' => 'Record deleted successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete record.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getStatusList(StatusList $statusService)
    {
        return response()->json([
            'success' => true,
            'data' => $statusService->statusList()
        ], 200);

    }

    public function getAssistanceTypesList(AssistanceTypesList $assistanceTypes)
    {

        return response()->json([
            'success' => true,
            'data' => $assistanceTypes->assistanceOptionsV2(),
        ], 200);

    }
}