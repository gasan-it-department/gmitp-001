<?php

namespace App\External\Api\Controllers\GoodsDistribution;

use App\Core\GoodsDistribution\Actions\ApplyDistributionRequirementsAction;
use App\Core\GoodsDistribution\Actions\ReadDistributionRequestsAction;
use App\Core\GoodsDistribution\Actions\ReviewDistributionDocumentAction;
use App\Core\GoodsDistribution\Actions\SaveDistributionRequestAction;
use App\Core\GoodsDistribution\Actions\SaveProgramDocumentRequirementsAction;
use App\Core\GoodsDistribution\Actions\SyncDistributionHouseholdAction;
use App\Core\GoodsDistribution\Actions\TransitionDistributionRequestAction;
use App\Core\GoodsDistribution\Dto\DistributionRequestDto;
use App\External\Api\Request\GoodsDistribution\ApplyDistributionRequirementsRequest;
use App\External\Api\Request\GoodsDistribution\DistributionCommandRequest;
use App\External\Api\Request\GoodsDistribution\DistributionDocumentRequest;
use App\External\Api\Request\GoodsDistribution\DistributionLookupRequest;
use App\External\Api\Request\GoodsDistribution\SaveDistributionRequest;
use App\External\Api\Request\GoodsDistribution\SaveProgramDocumentsRequest;
use App\External\Api\Request\GoodsDistribution\SyncDistributionHouseholdRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

final class DistributionRequestController extends Controller
{
    public function applyRequirements(ApplyDistributionRequirementsRequest $request, ApplyDistributionRequirementsAction $action): JsonResponse
    {
        return $this->respond(fn () => $action->execute(new DistributionRequestDto(app('municipal_id'), $request->user()->id, $request->validated(), $request->route('requestId'))));
    }

    public function syncHousehold(SyncDistributionHouseholdRequest $request, SyncDistributionHouseholdAction $action): JsonResponse
    {
        return $this->respond(fn () => $action->execute(new DistributionRequestDto(app('municipal_id'), $request->user()->id, $request->validated(), $request->route('requestId'))));
    }

    public function save(SaveDistributionRequest $request, SaveDistributionRequestAction $action): JsonResponse
    {
        return $this->respond(fn () => $action->execute(new DistributionRequestDto(app('municipal_id'), $request->user()->id, $request->validated(), $request->route('requestId'))));
    }

    public function transition(DistributionCommandRequest $request, TransitionDistributionRequestAction $action): JsonResponse
    {
        return $this->respond(fn () => $action->execute(new DistributionRequestDto(app('municipal_id'), $request->user()->id, $request->validated(), $request->route('requestId')), $request->route('command')));
    }

    public function document(DistributionDocumentRequest $request, ReviewDistributionDocumentAction $action): JsonResponse
    {
        return $this->respond(fn () => $action->execute(new DistributionRequestDto(app('municipal_id'), $request->user()->id, $request->safe()->except('file'), $request->route('requestId')), $request->route('checkId'), $request->route('upload') ? $request->file('file') : null));
    }

    public function requirements(SaveProgramDocumentsRequest $request, SaveProgramDocumentRequirementsAction $action): JsonResponse
    {
        return $this->respond(fn () => $action->execute(app('municipal_id'), $request->user()->id, $request->route('programId'), $request->validated()));
    }

    public function lookup(DistributionLookupRequest $request, ReadDistributionRequestsAction $read): JsonResponse
    {
        if ($request->route('lookup') === 'recipients') {
            return response()->json(['data' => $request->validated('beneficiary_id')
                ? [$read->recipient(app('municipal_id'), $request->validated('beneficiary_id'))]
                : $read->recipients(app('municipal_id'), $request->validated('search') ?? '')]);
        }
        $items = $read->items(app('municipal_id'), $request->validated('program_id'), $request->validated('search') ?? '');

        return response()->json(['data' => collect($items->items())->map(fn ($row) => ['id' => $row->item->id, 'name' => $row->item->name,
            'code' => $row->item->code, 'base_unit' => $row->item->base_unit, 'is_active' => true]),
            'links' => ['next' => $items->nextPageUrl(), 'prev' => $items->previousPageUrl()],
            'meta' => ['current_page' => $items->currentPage(), 'last_page' => $items->lastPage(), 'total' => $items->total(), 'from' => $items->firstItem(), 'to' => $items->lastItem()]]);
    }

    private function respond(\Closure $operation): JsonResponse
    {
        try {
            $record = $operation();

            return response()->json(['data' => ['id' => $record->id], 'message' => 'Goods distribution records updated.']);
        } catch (\DomainException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => ['distribution' => [$exception->getMessage()]]], 422);
        }
    }
}
