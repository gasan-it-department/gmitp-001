<?php

use App\Core\GoodsDistribution\Actions\ReconcileBulkDispatchAction;
use App\Core\GoodsDistribution\Actions\SaveBulkDispatchAction;
use App\Core\GoodsDistribution\Actions\TransitionBulkDispatchAction;
use App\Core\GoodsDistribution\Dto\BulkDispatchDto;
use App\Core\GoodsDistribution\Models\BulkDispatch;
use App\Core\GoodsDistribution\Services\BulkDispatchAllocationService;
use Illuminate\Support\Str;

require_once __DIR__.'/GoodsDistributionFixture.php';

function bulkFixture(object $test): void
{
    goodsDistributionFixture($test);
    $test->actor->givePermissionTo(collect(['view', 'prepare', 'approve', 'dispatch', 'reconcile', 'correct'])->map(fn ($capability) => 'goods_distribution.bulk_dispatches.'.$capability)->all());
}

function bulkData(object $test, array $changes = []): array
{
    return array_replace(['submission_key' => (string) Str::uuid(), 'program_id' => $test->program->id, 'storage_location_id' => $test->location->id,
        'requester_name' => 'Barangay Chairperson', 'requester_role' => 'Barangay official', 'custodian_type' => 'staff',
        'custodian_name' => 'MSWD Delivery Staff', 'custodian_role' => 'Distribution team leader', 'destination_barangays' => ['Uno', 'Pinggan'],
        'purpose' => 'home_delivery', 'purpose_notes' => 'Home deliveries to bedridden seniors', 'lines' => [['item_id' => $test->item->id, 'quantity' => '100']]], $changes);
}

function bulkDraft(object $test, array $changes = []): BulkDispatch
{
    return app(SaveBulkDispatchAction::class)->execute(new BulkDispatchDto($test->municipalId, $test->actor->id, bulkData($test, $changes)));
}

function bulkCommand(object $test, BulkDispatch $dispatch, string $command, array $data = []): BulkDispatch
{
    return app(TransitionBulkDispatchAction::class)->execute(new BulkDispatchDto($test->municipalId, $test->actor->id,
        ['version' => $dispatch->fresh()->version, 'operation_key' => (string) Str::uuid(), ...$data], $dispatch->id), $command);
}

function bulkApprove(object $test, BulkDispatch $dispatch): BulkDispatch
{
    $preview = app(BulkDispatchAllocationService::class)->approvalPreview($dispatch->fresh());

    return bulkCommand($test, $dispatch, 'approve', ['fingerprint' => $preview['fingerprint']]);
}

function bulkDepart(object $test, ?BulkDispatch $dispatch = null, array $changes = []): BulkDispatch
{
    $dispatch ??= bulkApprove($test, bulkDraft($test, $changes));

    return bulkCommand($test, $dispatch, 'dispatch', ['actual_on' => today()->toDateString(), 'custodian_acknowledged' => true,
        'confirmed_allocation_ids' => $dispatch->allocations()->where('status', 'reserved')->pluck('id')->sort()->values()->all()]);
}

function bulkReconcile(object $test, BulkDispatch $dispatch, string $kind, array $lines, array $changes = []): BulkDispatch
{
    $data = ['version' => $dispatch->fresh()->version, 'operation_key' => (string) Str::uuid(), 'kind' => $kind,
        'actual_on' => today()->toDateString(), 'reference' => 'SIGNED-SHEET-1', 'usable_confirmed' => true, 'lines' => $lines, ...$changes];
    $preview = app(BulkDispatchAllocationService::class)->reconciliationPreview($dispatch->fresh(), $data);

    return app(ReconcileBulkDispatchAction::class)->execute(new BulkDispatchDto($test->municipalId, $test->actor->id,
        [...$data, 'fingerprint' => $preview['fingerprint']], $dispatch->id));
}
