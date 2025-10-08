<?php

namespace App\External\Api\Controllers\ActionCenter;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\External\Api\Request\ActionCenter\ClientAssistanceRequest;
use App\Core\ActionCenter\Applications\Services\CreateAssistanceRequest;
use App\Core\ActionCenter\Infrastructures\Models\AssistanceRequest;
use App\Core\ActionCenter\Infrastructures\Models\Beneficiary;

class ActionCenterController extends Controller
{

    public function __construct(
        private CreateAssistanceRequest $createAssistaceRequest,
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
        ]);
    }



    /**
     * Show a specific client request.
     * GET /client/action-center/requests/{id}
     */
    public function show($id)
    {
        // Example: find request by ID
        // $requestModel = RequestModel::findOrFail($id);

        return response()->json(['message' => "Showing request {$id}"]);
    }

    /**
     * Update a specific client request.
     * PUT/PATCH /client/action-center/requests/{id}
     */
    public function update(Request $request, $id)
    {
        // Example: validate and update
        // $validated = $request->validate([...]);
        // $requestModel = RequestModel::findOrFail($id);
        // $requestModel->update([...]);

        return response()->json(['message' => "Request {$id} updated"]);
    }

    /**
     * Delete a specific client request.
     * DELETE /client/action-center/requests/{id}
     */
    public function destroy($id)
    {
        // Example: find and delete
        // $requestModel = RequestModel::findOrFail($id);
        // $requestModel->delete();

        return response()->json(['message' => "Request {$id} deleted"]);
    }


}