<?php

namespace App\External\Api\Controllers\ActionCenter;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\External\Api\Request\ActionCenter\ClientAssistanceRequest;
use App\Core\ActionCenter\Applications\Services\CreateAssistanceRequest;
use App\Core\ActionCenter\Infrastructures\Models\AssistanceRequest;
use App\Core\ActionCenter\Applications\Services\UpdateAssistanceRequest;
use App\Core\ActionCenter\Infrastructures\Repositories\AssistanceRequestRepositories;

class ActionCenterController extends Controller
{

    public function __construct(
        private CreateAssistanceRequest $createAssistaceRequest,
        private UpdateAssistanceRequest $updateAssistanceRequest,
        protected AssistanceRequestRepositories $assistanceRepository
    ) {
    }


    /**
     * Store a new client request.
     * POST /client/action-center/requests
     */
    public function store(ClientAssistanceRequest $request)
    {
        $validated = $request->validated();

        $user = request()->user();

        $this->createAssistaceRequest->execute($validated, $user);

        return response()->json(['message' => 'request created'], 200);
    }

    /**
     * Display a list of all client requests.
     * GET /client/action-center/requests
     */
    public function index()
    {
        // Example: return all requests for the authenticated client
        // $requests = RequestModel::where('user_id', auth()->id())->get();
        $request = AssistanceRequest::with('beneficiary')->get();

        return response()->json([
            'request' => $request,
            'message' => 'List of client requests'
        ], 200);
    }



    /**
     * Show a specific client request.
     * GET /client/action-center/requests/{id}
     */
    public function show($id)
    {
        // Example: find request by ID
        // $requestModel = RequestModel::findOrFail($id);

        return response()->json(['message' => "Showing request {$id}"], 200);
    }

    /**
     * Update a specific client request.
     * PUT/PATCH /client/action-center/requests/{id}
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'assistance_type' => 'sometimes|string',
            'description' => 'sometimes|string',
            'status' => 'sometimes|string|in:PENDING,APPROVED,REJECTED',
            'first_name' => 'sometimes|string',
            'last_name' => 'sometimes|string',
            'middle_name' => 'nullable|string',
            'suffix' => 'nullable|string',
            'birth_date' => 'sometimes|date',
            'contact_number' => 'sometimes|string',
            'province' => 'sometimes|string',
            'municipality' => 'sometimes|string',
            'barangay' => 'sometimes|string',
        ]);

        $user = $request->user();

        $this->updateAssistanceRequest->execute($id, $validated, $user);

        // Now this works because $assistanceRepository exists
        $updatedRequest = $this->assistanceRepository->findOrFail($id);

        return response()->json([
            'message' => "Request {$id} updated successfully",
            'request' => $updatedRequest,
        ], 200);
    }

    public function deleteRequest($id)
    {
        $request = AssistanceRequest::findOrFail($id);
        $request->delete();
        return response()->json(['message' => 'Deleted successfully'], 200);
    }



    /**
     * Delete a specific client request.
     * DELETE /client/action-center/requests/{id}
     */
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
}