<?php

namespace App\External\Api\Controllers\GoodsDistribution;

use App\Core\GoodsDistribution\Actions\SaveBulkDispatchRecipientAction;
use App\Core\GoodsDistribution\Dto\BulkDispatchRecipientDto;
use App\Core\GoodsDistribution\Models\BulkDispatchRecipient;
use App\Core\GoodsDistribution\Services\BulkDispatchRecipientService;
use App\Core\GoodsDistribution\Services\BulkDispatchService;
use App\External\Api\Request\GoodsDistribution\BulkDispatchRecipientRequest;
use App\External\Api\Resources\GoodsDistribution\BulkDispatchRecipientResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

final class BulkDispatchRecipientController extends Controller
{
    public function read(BulkDispatchRecipientRequest $request, BulkDispatchService $bulk, BulkDispatchRecipientService $recipients): JsonResponse
    {
        $bulk->actor(app('municipal_id'), $request->user()->id, 'view');
        $dispatch = $bulk->record(app('municipal_id'), $request->route('dispatchId'));
        abort_unless($recipients->schemaReady(), 409, 'Recipient recording migrations are pending.');
        if ($request->route('lookup') === 'candidates') {
            return response()->json(['data' => $recipients->candidates($dispatch, $request->validated('search') ?? '', $request->validated('exclude_id'))]);
        }
        if ($request->route('recipientId')) {
            $record = BulkDispatchRecipient::query()->where('municipal_id', $dispatch->municipal_id)->where('bulk_dispatch_id', $dispatch->id)
                ->whereKey($request->route('recipientId'))->with('lines')->firstOrFail();

            return (new BulkDispatchRecipientResource($record))->response();
        }

        return response()->json(['records' => BulkDispatchRecipientResource::collection($recipients->listing($dispatch, $request->validated()))->response()->getData(true),
            'coverage' => $recipients->coverage($dispatch)]);
    }

    public function save(BulkDispatchRecipientRequest $request, SaveBulkDispatchRecipientAction $action, BulkDispatchRecipientService $recipients): JsonResponse
    {
        try {
            $record = $action->execute(new BulkDispatchRecipientDto(app('municipal_id'), $request->user()->id, $request->route('dispatchId'),
                $request->validated(), $request->route('recipientId')), $request->route('recipientCommand'));

            return response()->json(['data' => (new BulkDispatchRecipientResource($record))->resolve(),
                'dispatch_version' => $record->dispatch->version, 'similar_entries' => $recipients->candidates($record->dispatch, $record->full_name, $record->id)]);
        } catch (\DomainException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => ['recipient' => [$exception->getMessage()]]], 422);
        }
    }
}
