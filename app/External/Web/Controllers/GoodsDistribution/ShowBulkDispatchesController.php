<?php

namespace App\External\Web\Controllers\GoodsDistribution;

use App\Core\GoodsDistribution\Actions\ReadBulkDispatchesAction;
use App\Core\GoodsDistribution\Actions\ReadGoodsInventoryAction;
use App\Core\GoodsDistribution\Dto\InventoryFiltersDto;
use App\Core\GoodsDistribution\Enums\BulkCustodianType;
use App\Core\GoodsDistribution\Enums\BulkDispatchPurpose;
use App\Core\GoodsDistribution\Models\BulkDispatchAdditionalIssue;
use App\Core\GoodsDistribution\Models\BulkDispatchRecipient;
use App\Core\GoodsDistribution\Services\BulkAdditionalIssueService;
use App\Core\GoodsDistribution\Services\BulkDispatchAllocationService;
use App\Core\GoodsDistribution\Services\BulkDispatchRecipientService;
use App\Core\GoodsDistribution\Services\BulkDispatchService;
use App\External\Api\Request\GoodsDistribution\BulkDispatchPageRequest;
use App\External\Api\Resources\GoodsDistribution\BulkAdditionalIssueResource;
use App\External\Api\Resources\GoodsDistribution\BulkDispatchRecipientResource;
use App\External\Api\Resources\GoodsDistribution\BulkDispatchResource;
use App\External\Api\Resources\GoodsDistribution\InventoryItemResource;
use App\Http\Controllers\Controller;
use Carbon\CarbonImmutable;
use Inertia\Inertia;
use Inertia\Response;

final class ShowBulkDispatchesController extends Controller
{
    public function __invoke(BulkDispatchPageRequest $request, ReadBulkDispatchesAction $read, ReadGoodsInventoryAction $inventory, BulkDispatchService $bulk, BulkDispatchAllocationService $allocations): Response
    {
        $municipalId = app('municipal_id');
        $bulk->actor($municipalId, $request->user()->id, 'view');
        $permissions = collect(['view', 'prepare', 'approve', 'dispatch', 'reconcile', 'correct'])
            ->mapWithKeys(fn ($capability) => [$capability => $request->user()->can('goods_distribution.bulk_dispatches.'.$capability)])->all();
        $common = ['permissions' => $permissions, 'filters' => $request->validated(), 'today' => today()->toDateString()];
        if (! $read->schemaReady()) {
            return Inertia::render('GoodsDistribution/BulkDispatch/Unavailable', $common);
        }
        $screen = $request->route('screen');
        if ($screen === 'list') {
            return Inertia::render('GoodsDistribution/BulkDispatch/Index', [...$common, 'options' => $read->options($municipalId, true),
                'records' => BulkDispatchResource::collection($read->listing($municipalId, $request->validated()))->response()->getData(true)]);
        }
        $dispatch = $screen === 'create' ? null : $bulk->record($municipalId, $request->route('dispatchId'))->load('lines');
        if ($screen === 'create' || $screen === 'edit') {
            abort_if($dispatch && $dispatch->status->value !== 'draft', 409, 'Only drafts may be edited.');

            return Inertia::render('GoodsDistribution/BulkDispatch/Form', [...$common, 'dispatch' => $dispatch ? (new BulkDispatchResource($dispatch))->resolve() : null,
                'options' => $read->options($municipalId)]);
        }
        $tab = $request->validated('tab') ?? 'goods';
        $itemIds = $dispatch->lines->pluck('item_id')->all();
        $stock = $itemIds ? $inventory->inventory($municipalId, new InventoryFiltersDto(['program_id' => $dispatch->program_id,
            'location_id' => $dispatch->storage_location_id, 'include_zero' => '1']), false, $itemIds) : collect();
        $props = [...$common, 'dispatch' => (new BulkDispatchResource($dispatch))->resolve(),
            'allocations' => array_values($allocations->balances($dispatch)),
            'stock' => InventoryItemResource::collection($stock)->resolve()];
        $props['additionalIssuesReady'] = app(BulkAdditionalIssueService::class)->schemaReady();
        if ($props['additionalIssuesReady']) {
            $issues = BulkDispatchAdditionalIssue::query()->where('municipal_id', $municipalId)->where('bulk_dispatch_id', $dispatch->id);
            $props['hasPendingAdditionalIssues'] = (clone $issues)->whereIn('status', ['pending', 'approved'])->exists();
            if ($tab === 'goods') {
                $props['additionalIssues'] = BulkAdditionalIssueResource::collection($issues->orderByDesc('created_at')->orderByDesc('id')->paginate(10)->withQueryString())->response()->getData(true);
            }
        }
        if ($tab === 'recipients') {
            $recipientRead = app(BulkDispatchRecipientService::class);
            $props['recipientReady'] = $recipientRead->schemaReady();
            if ($props['recipientReady']) {
                $props['recipients'] = BulkDispatchRecipientResource::collection($recipientRead->listing($dispatch, $request->validated()))->response()->getData(true);
                $props['recipientCoverage'] = $recipientRead->coverage($dispatch);
                $entries = BulkDispatchRecipient::query()->where('municipal_id', $municipalId)->where('bulk_dispatch_id', $dispatch->id);
                $props['recipientCounts'] = ['active' => (clone $entries)->where('status', 'active')->count(),
                    'without_quantities' => (clone $entries)->where('status', 'active')->whereDoesntHave('lines')->count()];
                $props['recipientBarangays'] = (clone $entries)->whereNotNull('barangay')->distinct()->orderBy('barangay')->pluck('barangay')->all();
            }
        }
        if ($tab === 'reconciliation') {
            $events = $read->reconciliationHistory($dispatch);
            $props['reconciliations'] = ['data' => collect($events->items())->map(fn ($event) => [
                'id' => $event->id, 'kind' => $event->kind, 'occurred_on' => $event->occurred_on->toDateString(), 'reference' => $event->reference,
                'notes' => $event->notes, 'reversal_id' => $event->reversal?->id, 'reverses_reconciliation_id' => $event->reverses_reconciliation_id,
                'lines' => $event->lines->map(fn ($line) => ['id' => $line->id, 'quantity' => $line->quantity, 'base_unit' => $line->base_unit,
                    'item_name' => $line->allocation->line->item_name_snapshot])->values()->all(),
            ])->all(), 'links' => ['next' => $events->nextPageUrl(), 'prev' => $events->previousPageUrl()], 'meta' => ['total' => $events->total(), 'current_page' => $events->currentPage(), 'last_page' => $events->lastPage(), 'from' => $events->firstItem(), 'to' => $events->lastItem()]];
        }
        if ($tab === 'attachments') {
            $props['attachments'] = $dispatch->getMedia('bulk_dispatch_evidence')->map(fn ($media) => ['id' => $media->id, 'name' => $media->name, 'mime_type' => $media->mime_type, 'created_at' => $media->created_at->toIso8601String()])->all();
        }
        if ($tab === 'history') {
            $props['historyChoices'] = ['custodian_types' => BulkCustodianType::options(), 'purposes' => BulkDispatchPurpose::options()];
            $events = $read->history($dispatch);
            $props['history'] = ['data' => collect($events->items())->map(fn ($event) => ['id' => $event->id, 'description' => $event->description,
                'actor' => $event->causer ? trim($event->causer->first_name.' '.$event->causer->last_name) : 'Former staff member',
                'created_at' => $event->created_at->toIso8601String(), 'properties' => $this->historyProperties($event->properties->toArray())])->all(),
                'links' => ['next' => $events->nextPageUrl(), 'prev' => $events->previousPageUrl()]];
        }

        return Inertia::render('GoodsDistribution/BulkDispatch/Details', $props);
    }

    private function historyProperties(array $properties): array
    {
        foreach (['before', 'after'] as $side) {
            $date = $properties[$side]['additional_issue']['actual_issue_on'] ?? null;
            if (is_string($date) && str_contains($date, 'T')) {
                // Older audits serialized local midnight as a UTC timestamp.
                $properties[$side]['additional_issue']['actual_issue_on'] = CarbonImmutable::parse($date)
                    ->setTimezone(config('app.timezone'))->toDateString();
            }
        }

        return $properties;
    }
}
