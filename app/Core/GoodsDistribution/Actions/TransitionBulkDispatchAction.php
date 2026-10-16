<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Dto\BulkDispatchDto;
use App\Core\GoodsDistribution\Models\BulkDispatch;
use App\Core\GoodsDistribution\Services\BulkAdditionalIssueService;
use App\Core\GoodsDistribution\Services\BulkDispatchAllocationService;
use App\Core\GoodsDistribution\Services\BulkDispatchService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use App\Core\Users\Models\User;
use Illuminate\Support\Facades\DB;

final class TransitionBulkDispatchAction
{
    public function __construct(private readonly BulkDispatchService $bulk, private readonly BulkDispatchAllocationService $allocations, private readonly StockLedgerService $ledger) {}

    public function execute(BulkDispatchDto $dto, string $command): BulkDispatch
    {
        return DB::transaction(function () use ($dto, $command) {
            $this->ledger->lockMunicipality($dto->municipalId);
            $dispatch = $this->bulk->record($dto->municipalId, $dto->dispatchId, true);
            $permission = match ($command) {
                'approve', 'withdraw' => 'approve', 'dispatch' => 'dispatch', 'close' => 'reconcile', 'reopen' => 'correct',
                'cancel' => $dispatch->status->value === 'draft' ? 'prepare' : 'approve',
                default => throw new \DomainException('Unknown dispatch command.'),
            };
            $this->bulk->actor($dto->municipalId, $dto->actorId, $permission);
            if ($this->bulk->operation($dispatch, $dto->actorId, $command, $dto->data)) {
                return $dispatch;
            }
            $this->bulk->version($dispatch, (int) ($dto->data['version'] ?? 0));
            $before = [...$dispatch->toArray(), 'allocations' => $this->allocations->balances($dispatch)];
            $attributes = [];
            switch ($command) {
                case 'approve':
                    $preview = $this->allocations->approvalPreview($dispatch, true);
                    if (! hash_equals($preview['fingerprint'], $dto->data['fingerprint'] ?? '')) {
                        throw new \DomainException('Approval review changed. Review the proposed batches again.');
                    }
                    $revision = $dispatch->approval_revision + 1;
                    foreach ($preview['allocations'] as $entry) {
                        $dispatch->allocations()->create(['municipal_id' => $dto->municipalId, 'bulk_dispatch_line_id' => $entry['line_id'],
                            'stock_receipt_line_id' => $entry['batch_id'], 'base_unit' => $entry['base_unit'], 'quantity' => $entry['quantity'], 'approval_revision' => $revision]);
                    }
                    $attributes = ['status' => 'approved', 'approval_revision' => $revision, 'approval_snapshot' => $preview['snapshot'],
                        'program_name_snapshot' => $preview['snapshot']['program_name'], 'storage_name_snapshot' => $preview['snapshot']['storage_name'],
                        'custodian_name' => $preview['snapshot']['custodian_name'], 'approved_at' => now(), 'approved_by_user_id' => $dto->actorId];
                    break;
                case 'withdraw':
                case 'cancel':
                    if (! in_array($dispatch->status->value, $command === 'withdraw' ? ['approved'] : ['draft', 'approved'], true)) {
                        throw new \DomainException('Only undispatched goods can be cancelled or have approval withdrawn.');
                    }
                    $reason = $this->bulk->reason($dto->data);
                    $this->allocations->cancelReservations($dispatch);
                    $attributes = $command === 'withdraw'
                        ? ['status' => 'draft', 'approval_snapshot' => null, 'approved_at' => null, 'approved_by_user_id' => null, 'transition_reason' => $reason]
                        : ['status' => 'cancelled', 'cancelled_at' => now(), 'cancelled_by_user_id' => $dto->actorId, 'transition_reason' => $reason];
                    break;
                case 'dispatch':
                    if ($dispatch->status->value !== 'approved' || ! ($dto->data['custodian_acknowledged'] ?? false)) {
                        throw new \DomainException('Approve the dispatch and confirm the custodian acknowledgement.');
                    }
                    if ($dispatch->custodian_user_id && ! User::query()->where('municipal_id', $dto->municipalId)->whereKey($dispatch->custodian_user_id)->whereNull('deactivated_at')->exists()) {
                        throw new \DomainException('The assigned custodian is unavailable. Withdraw approval to change the custodian.');
                    }
                    $date = $this->allocations->eventDate($dto->data['actual_on'] ?? '', $dispatch->approved_at->toDateString());
                    $this->allocations->issue($dispatch, $dto->actorId, $date, $dto->data['confirmed_allocation_ids'] ?? []);
                    $attributes = ['status' => 'dispatched', 'actual_dispatch_on' => $date, 'dispatched_at' => now(), 'dispatched_by_user_id' => $dto->actorId, 'custodian_acknowledged' => true];
                    break;
                case 'close':
                    if ($dispatch->status->value !== 'dispatched') {
                        throw new \DomainException('Only dispatched records can be closed.');
                    }
                    if (app(BulkAdditionalIssueService::class)->schemaReady()
                        && \App\Core\GoodsDistribution\Models\BulkDispatchAdditionalIssue::query()->where('municipal_id', $dto->municipalId)
                            ->where('bulk_dispatch_id', $dispatch->id)->whereIn('status', ['pending', 'approved'])->exists()) {
                        throw new \DomainException('Issue or cancel every pending additional issue before closing this dispatch.');
                    }
                    $balances = $this->allocations->balances($dispatch, $this->allocations->lockedAllocations($dispatch));
                    if (! $balances || collect($balances)->contains(fn ($row) => $row['with_staff'] !== '0.000')) {
                        throw new \DomainException('Reconcile every issued quantity before closing this dispatch.');
                    }
                    $attributes = ['status' => 'closed', 'closed_at' => now(), 'closed_by_user_id' => $dto->actorId];
                    break;
                case 'reopen':
                    if ($dispatch->status->value !== 'closed') {
                        throw new \DomainException('Only closed dispatches can be reopened for correction.');
                    }
                    $attributes = ['status' => 'dispatched', 'transition_reason' => $this->bulk->reason($dto->data),
                        'reopened_at' => now(), 'reopened_by_user_id' => $dto->actorId];
                    break;
            }
            $this->bulk->completeOperation($dispatch, $dto->actorId, $command, $dto->data, $attributes);
            $this->ledger->audit($dispatch, $dto->actorId, ucfirst($command).' bulk dispatch', $before,
                [...$dispatch->toArray(), 'allocations' => $this->allocations->balances($dispatch)]);

            return $dispatch->fresh();
        });
    }
}
