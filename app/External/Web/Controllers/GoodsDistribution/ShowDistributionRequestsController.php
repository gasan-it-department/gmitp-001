<?php

namespace App\External\Web\Controllers\GoodsDistribution;

use App\Core\GoodsDistribution\Actions\ReadDistributionRequestsAction;
use App\Core\GoodsDistribution\Services\DistributionHouseholdService;
use App\Core\GoodsDistribution\Services\DistributionRequirementsService;
use App\External\Api\Request\GoodsDistribution\DistributionPageRequest;
use App\External\Api\Resources\GoodsDistribution\DistributionRequestResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

final class ShowDistributionRequestsController extends Controller
{
    public function __invoke(DistributionPageRequest $request, ReadDistributionRequestsAction $read): Response
    {
        $permissions = [];
        foreach (['view', 'intake', 'process', 'decide', 'release'] as $ability) {
            $permissions[$ability] = $request->user()->can('goods_distribution.requests.'.$ability);
        }
        $common = ['permissions' => $permissions, 'filters' => $request->validated(), 'today' => today()->toDateString()];
        if (! $read->schemaReady()) {
            return Inertia::render('GoodsDistribution/Inventory/Unavailable', $common);
        }
        $screen = $request->route('screen');
        $municipalId = app('municipal_id');
        if ($screen === 'detail') {
            $record = $read->detail($municipalId, $request->route('requestId'));
            $history = $read->history($record);

            return Inertia::render('GoodsDistribution/Distribution/Details', [...$common,
                'request' => (new DistributionRequestResource($record))->resolve(),
                'requirementsUpdate' => $request->validated('tab') === 'documents' && ! $record->status->terminal()
                    ? \Illuminate\Support\Arr::except(app(DistributionRequirementsService::class)->preview($record), ['requirements']) : null,
                'householdSync' => $request->validated('tab') === 'household' && in_array($record->status->value, ['draft', 'pending', 'returned', 'under_review'], true)
                    ? app(DistributionHouseholdService::class)->preview($record) : null,
                'history' => ['data' => collect($history->items())->map(fn ($entry) => ['id' => $entry->id, 'description' => $entry->description,
                    'actor' => trim(($entry->causer?->first_name ?? '').' '.($entry->causer?->last_name ?? '')), 'created_at' => $entry->created_at->toIso8601String(), 'properties' => $entry->properties]),
                    'next' => $history->nextPageUrl(), 'previous' => $history->previousPageUrl()],
                'previousDistributions' => DistributionRequestResource::collection($read->previous($record))->resolve(),
            ]);
        }
        if ($screen === 'create' || $screen === 'edit') {
            $record = $screen === 'edit' ? $read->detail($municipalId, $request->route('requestId')) : null;
            if ($record && ! in_array($record->status->value, ['draft', 'pending', 'returned'], true)) {
                abort(409, 'Return this request before editing.');
            }
            if ($record) {
                app(\App\Core\GoodsDistribution\Services\DistributionRequestService::class)->actor($municipalId, $request->user()->id,
                    'goods_distribution.requests.'.app(\App\Core\GoodsDistribution\Services\DistributionRequestService::class)->editingCapability($record, $request->user()->id));
            }

            return Inertia::render('GoodsDistribution/Distribution/Form', [...$common, 'options' => $read->options($municipalId),
                'canRegister' => $request->user()->can('action_center.access') && $request->user()->can('action_center.beneficiaries.view') && $request->user()->can('action_center.beneficiaries.manage'),
                'request' => $record ? (new DistributionRequestResource($record))->resolve() : null,
                'selectedRecipient' => ($id = $record?->beneficiary_id ?? $request->validated('beneficiary_id')) ? $read->recipient($municipalId, $id) : null]);
        }

        return Inertia::render('GoodsDistribution/Distribution/Index', [...$common, 'options' => $read->options($municipalId),
            'records' => DistributionRequestResource::collection($read->listing($municipalId, $request->validated()))->response()->getData(true)]);
    }
}
