<?php

namespace App\External\Api\Controllers\ActionCenter;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Core\ActionCenter\Applications\Dto\AssistanceRequestDto;
use App\External\Api\Request\ActionCenter\ClientAssistanceRequest;

class ActionCenterController extends Controller
{


    /**
     * Store a new client request.
     * POST /client/action-center/requests
     */
    public function store(ClientAssistanceRequest $request)
    {
        $validated = $request->validated();

        $user = request()->user();
        dd($validated);
        // $dto = new AssistanceRequestDto(
        //     $validated['first_name'],
        //     $validated['last_name'],
        //     $validated['middle_name'],
        //     $validated['suffix'],
        //     $validated['contact_number'],
        //     $validated['province'],
        //     $validated['municipality'],
        //     $validated['barangay'],
        //     $validated['assistance_type'],
        // );

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
        return response()->json(['message' => 'List of client requests']);
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