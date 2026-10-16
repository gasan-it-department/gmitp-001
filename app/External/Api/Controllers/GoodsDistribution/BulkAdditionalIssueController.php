<?php

namespace App\External\Api\Controllers\GoodsDistribution;

use App\Core\GoodsDistribution\Actions\ManageBulkAdditionalIssueAction;
use App\Core\GoodsDistribution\Dto\BulkDispatchDto;
use App\Core\GoodsDistribution\Services\BulkAdditionalIssueService;
use App\Core\GoodsDistribution\Services\BulkDispatchService;
use App\External\Api\Request\GoodsDistribution\BulkAdditionalIssueRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

final class BulkAdditionalIssueController extends Controller
{
    public function __invoke(BulkAdditionalIssueRequest $request, BulkDispatchService $bulk, BulkAdditionalIssueService $additional, ManageBulkAdditionalIssueAction $action): JsonResponse
    {
        try {
            $dto = new BulkDispatchDto(app('municipal_id'), $request->user()->id, $request->validated(), $request->route('dispatchId'));
            if ($request->route('additionalCommand') === 'preview') {
                $bulk->actor($dto->municipalId, $dto->actorId, 'approve');
                abort_unless($additional->schemaReady(), 409, 'Additional issues require the database update.');
                $dispatch = $bulk->record($dto->municipalId, $dto->dispatchId);
                $bulk->version($dispatch, $dto->data['version']);

                return response()->json(['data' => $additional->preview($dispatch, $additional->record($dispatch, $request->route('issueId')))]);
            }
            $issue = $action->execute($dto, $request->route('additionalCommand'), $request->route('issueId'));

            return response()->json(['data' => ['id' => $issue->id], 'message' => 'Additional issue updated.']);
        } catch (\DomainException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => ['additional_issue' => [$exception->getMessage()]]], 422);
        }
    }
}
