<?php

namespace App\External\Api\Controllers\GoodsDistribution;

use App\Core\GoodsDistribution\Actions\ReadBulkDispatchesAction;
use App\Core\GoodsDistribution\Actions\ReconcileBulkDispatchAction;
use App\Core\GoodsDistribution\Actions\SaveBulkDispatchAction;
use App\Core\GoodsDistribution\Actions\TransitionBulkDispatchAction;
use App\Core\GoodsDistribution\Actions\UploadBulkDispatchEvidenceAction;
use App\Core\GoodsDistribution\Dto\BulkDispatchDto;
use App\Core\GoodsDistribution\Services\BulkDispatchAllocationService;
use App\Core\GoodsDistribution\Services\BulkDispatchService;
use App\External\Api\Request\GoodsDistribution\BulkDispatchAttachmentRequest;
use App\External\Api\Request\GoodsDistribution\BulkDispatchCommandRequest;
use App\External\Api\Request\GoodsDistribution\BulkDispatchPageRequest;
use App\External\Api\Request\GoodsDistribution\SaveBulkDispatchRequest;
use App\External\Api\Resources\GoodsDistribution\CatalogResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

final class BulkDispatchController extends Controller
{
    public function save(SaveBulkDispatchRequest $request, SaveBulkDispatchAction $action): JsonResponse
    {
        return $this->respond(fn () => $action->execute($this->dto($request)));
    }

    public function transition(BulkDispatchCommandRequest $request, TransitionBulkDispatchAction $action): JsonResponse
    {
        return $this->respond(fn () => $action->execute($this->dto($request), $request->route('command')));
    }

    public function reconcile(BulkDispatchCommandRequest $request, ReconcileBulkDispatchAction $action): JsonResponse
    {
        $dto = $this->dto($request);
        $kind = match ($request->route('command')) {
            'return' => 'return', 'report' => 'distribution', default => null
        };
        if ($kind) {
            $dto = new BulkDispatchDto($dto->municipalId, $dto->actorId, [...$dto->data, 'kind' => $kind], $dto->dispatchId);
        }

        return $this->respond(fn () => $action->execute($dto, $request->route('command') === 'reverse'));
    }

    public function preview(BulkDispatchCommandRequest $request, BulkDispatchService $bulk, BulkDispatchAllocationService $allocations): JsonResponse
    {
        try {
            $approval = $request->route('command') === 'approval-preview';
            $bulk->actor(app('municipal_id'), $request->user()->id, $approval ? 'approve' : 'reconcile');
            $dispatch = $bulk->record(app('municipal_id'), $request->route('dispatchId'));

            return response()->json(['data' => $approval ? $allocations->approvalPreview($dispatch) : $allocations->reconciliationPreview($dispatch, $request->validated())]);
        } catch (\DomainException $exception) {
            return $this->error($exception);
        }
    }

    public function items(BulkDispatchPageRequest $request, ReadBulkDispatchesAction $read, BulkDispatchService $bulk): JsonResponse
    {
        $bulk->actor(app('municipal_id'), $request->user()->id, 'view');

        return CatalogResource::collection($read->items(app('municipal_id'), $request->validated('program_id') ?? '', $request->validated('search') ?? ''))->response();
    }

    public function attachment(BulkDispatchAttachmentRequest $request, UploadBulkDispatchEvidenceAction $action): JsonResponse
    {
        return $this->respond(fn () => $action->execute(new BulkDispatchDto(app('municipal_id'), $request->user()->id,
            $request->safe()->only(['version', 'operation_key']), $request->route('dispatchId')), $request->file('file')));
    }

    private function dto(mixed $request): BulkDispatchDto
    {
        return new BulkDispatchDto(app('municipal_id'), $request->user()->id, $request->validated(), $request->route('dispatchId'));
    }

    private function respond(\Closure $action): JsonResponse
    {
        try {
            $dispatch = $action();

            return response()->json(['data' => ['id' => $dispatch->id], 'message' => 'Bulk dispatch updated.']);
        } catch (\DomainException $exception) {
            return $this->error($exception);
        }
    }

    private function error(\DomainException $exception): JsonResponse
    {
        return response()->json(['message' => $exception->getMessage(), 'errors' => ['dispatch' => [$exception->getMessage()]]], 422);
    }
}
