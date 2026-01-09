<?php

namespace App\External\Api\Controllers\ActionCenter;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Core\ActionCenter\Requests\Services\StatusList;
use App\Core\ActionCenter\Requests\Dto\AssistanceQueryDto;
use App\Core\ActionCenter\Requests\Dto\CreateAssistanceDto;
use App\External\Api\Request\ActionCenter\AssistanceRequest;
use App\External\Api\Request\ActionCenter\BeneficiaryRequest;
use App\External\Api\Resources\ActionCenter\AssistanceResource;
use App\Core\ActionCenter\Requests\Services\AssistanceTypesList;
use App\Core\ActionCenter\Beneficiaries\Dto\CreateBeneficiaryDto;
use App\Core\ActionCenter\Beneficiaries\UseCase\CreateBeneficiaryUseCase;
use App\Core\ActionCenter\Requests\UseCase\CreateAssistanceRequestUseCase;
use App\Core\ActionCenter\Requests\UseCase\GetAllAssistancePerMunicipality;
use App\Core\ActionCenter\Requests\UseCase\GetAssistanceRequestByIdUseCase;
use App\Core\ActionCenter\Requests\UseCase\GetAssistancePerMunicipalityUseCase;

class ActionCenterController extends Controller
{

    public function __construct(

        private CreateBeneficiaryUseCase $createBeneficiary,

        private CreateAssistanceRequestUseCase $createAssistance,

        private GetAssistancePerMunicipalityUseCase $getAllAssistance,

        private AssistanceTypesList $assistanceTypesList,

        private GetAssistanceRequestByIdUseCase $getAssistanceById

    ) {
    }


    public function store(AssistanceRequest $assistanceRequest, BeneficiaryRequest $beneficiaryRequest)
    {

        $municipalId = app('municipal_id');

        try {

            $result = DB::transaction(function () use ($assistanceRequest, $beneficiaryRequest, $municipalId) {

                $beneficiaryDto = CreateBeneficiaryDto::fromRequest($beneficiaryRequest);

                $beneficiary = $this->createBeneficiary->execute($beneficiaryDto);

                $assistanceDto = CreateAssistanceDto::fromRequest($assistanceRequest, $beneficiary->id);

                $assistance = $this->createAssistance->execute($assistanceDto, $municipalId);

                return [
                    'assistance' => $assistance,
                    'beneficiary' => $beneficiary
                ];
            });

            return redirect()->back()->with('success', 'Request submitted successfully.');


        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => 'An unexpected error occurred. Please try again later.'
            ]);
        }
    }

    public function fetch(Request $request)
    {
        $municipalId = app('municipal_id');

        $dto = AssistanceQueryDto::fromRequest($request);

        $assitance = $this->getAllAssistance->execute($municipalId, $dto);


        return AssistanceResource::collection($assitance)->additional([

            'success' => true,

        ]);

    }

    public function show($id)
    {

        $assistance = $this->getAssistanceById->execute($id);

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