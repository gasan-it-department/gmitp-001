<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Dto\BulkDispatchDto;
use App\Core\GoodsDistribution\Models\BulkDispatchAdditionalIssue;
use App\Core\GoodsDistribution\Services\BulkAdditionalIssueService;
use App\Core\GoodsDistribution\Services\BulkDispatchAllocationService;
use App\Core\GoodsDistribution\Services\BulkDispatchService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use App\Core\GoodsDistribution\Services\StockQuantityService;
use Illuminate\Support\Facades\DB;

final class ManageBulkAdditionalIssueAction
{
    public function __construct(private readonly BulkDispatchService $bulk, private readonly BulkAdditionalIssueService $additional,
        private readonly BulkDispatchAllocationService $allocations, private readonly StockLedgerService $ledger, private readonly StockQuantityService $quantities) {}

    public function execute(BulkDispatchDto $dto, string $command, ?string $issueId = null): BulkDispatchAdditionalIssue
    {
        return DB::transaction(function () use ($dto, $command, $issueId) {
            $this->ledger->lockMunicipality($dto->municipalId);
            $dispatch = $this->bulk->record($dto->municipalId, $dto->dispatchId, true);
            if (! $this->additional->schemaReady()) {
                throw new \DomainException('Additional issues require the database update.');
            }
            $issue = $command === 'create' ? null : $this->additional->record($dispatch, $issueId ?? '');
            $capability = match ($command) {
                'create' => 'prepare', 'approve' => 'approve', 'issue' => 'dispatch',
                'cancel' => $issue->approved_at !== null ? 'approve' : 'prepare',
                default => throw new \DomainException('Unknown additional issue command.'),
            };
            $this->bulk->actor($dto->municipalId, $dto->actorId, $capability);
            $operation = 'additional-'.$command.($issueId ? ':'.$issueId : '');
            if ($this->bulk->operation($dispatch, $dto->actorId, $operation, $dto->data)) {
                return $issue ?? BulkDispatchAdditionalIssue::query()->where('municipal_id', $dto->municipalId)->where('bulk_dispatch_id', $dispatch->id)
                    ->where('submission_operation_key', $dto->data['operation_key'])->firstOrFail();
            }
            $this->bulk->version($dispatch, (int) ($dto->data['version'] ?? 0));
            if ($dispatch->status->value !== 'dispatched') {
                throw new \DomainException('Additional goods can only be recorded on an active dispatched record.');
            }
            $before = $issue?->toArray() ?? [];
            if ($command === 'create') {
                $issue = BulkDispatchAdditionalIssue::create(['municipal_id' => $dto->municipalId, 'bulk_dispatch_id' => $dispatch->id,
                    'reason' => $this->bulk->reason($dto->data), 'lines_snapshot' => $this->additional->validateLines($dispatch, $dto->data['lines'] ?? []),
                    'submission_operation_key' => $dto->data['operation_key'], 'created_by_user_id' => $dto->actorId]);
            } elseif ($command === 'approve') {
                $preview = $this->additional->preview($dispatch, $issue, true);
                if (! hash_equals($preview['fingerprint'], $dto->data['fingerprint'] ?? '')) {
                    throw new \DomainException('The additional issue review changed. Review the proposed batches again.');
                }
                // Each issue has its own revision; the original approval and quantities stay untouched.
                $revision = (int) $dispatch->allocations()->max('approval_revision') + 1;
                $lines = $issue->lines_snapshot;
                foreach ($lines as &$snapshot) {
                    $line = $dispatch->lines()->where('item_id', $snapshot['item_id'])->first();
                    if (! $line) {
                        $line = $dispatch->lines()->create(['municipal_id' => $dto->municipalId, 'item_id' => $snapshot['item_id'],
                            'item_name_snapshot' => $snapshot['item_name_snapshot'], 'item_code_snapshot' => $snapshot['item_code_snapshot'],
                            'base_unit' => $snapshot['base_unit'], 'quantity' => null, 'sort_order' => (int) $dispatch->allLines()->max('sort_order') + 1]);
                    }
                    if ($line->base_unit !== $snapshot['base_unit']) {
                        throw new \DomainException('Additional goods must use the original item unit.');
                    }
                    $snapshot['id'] = $line->id;
                    foreach ($preview['allocations'] as $entry) {
                        if ($entry['item_id'] === $snapshot['item_id']) {
                            $dispatch->allocations()->create(['municipal_id' => $dto->municipalId, 'additional_issue_id' => $issue->id,
                                'bulk_dispatch_line_id' => $line->id, 'stock_receipt_line_id' => $entry['batch_id'], 'base_unit' => $entry['base_unit'],
                                'quantity' => $entry['quantity'], 'approval_revision' => $revision]);
                        }
                    }
                }
                unset($snapshot);
                $issue->update(['status' => 'approved', 'lines_snapshot' => $lines, 'approval_revision' => $revision,
                    'approved_at' => now(), 'approved_by_user_id' => $dto->actorId]);
            } elseif ($command === 'issue') {
                if ($issue->status->value !== 'approved' || ! ($dto->data['custodian_acknowledged'] ?? false)) {
                    throw new \DomainException('Approve the additional goods and confirm the custodian acknowledgement.');
                }
                $this->additional->validateCustodian($dispatch);
                $date = $this->allocations->eventDate($dto->data['actual_on'] ?? '', max($issue->approved_at->toDateString(), $dispatch->actual_dispatch_on->toDateString()));
                $rows = $this->allocations->lockedAllocations($dispatch)->where('additional_issue_id', $issue->id);
                foreach ($issue->lines_snapshot as $line) {
                    $sum = $rows->where('bulk_dispatch_line_id', $line['id'])->sum(fn ($row) => $this->quantities->parse($row->quantity, $row->base_unit));
                    if ($sum !== $this->quantities->parse($line['quantity'], $line['base_unit'])) {
                        throw new \DomainException('Additional reservations no longer match the approved quantities.');
                    }
                }
                if ($rows->contains(fn ($row) => $row->approval_revision !== $issue->approval_revision)) {
                    throw new \DomainException('Additional reservations no longer match this approval.');
                }
                $this->allocations->issueAllocations($dispatch, $rows, $dto->actorId, $date, $dto->data['confirmed_allocation_ids'] ?? []);
                $issue->update(['status' => 'issued', 'actual_issue_on' => $date, 'issued_at' => now(), 'issued_by_user_id' => $dto->actorId, 'custodian_acknowledged' => true]);
            } else {
                if (! in_array($issue->status->value, ['pending', 'approved'], true)) {
                    throw new \DomainException('Only unissued additional goods can be cancelled. Use unused returns for goods already collected.');
                }
                $reason = $this->bulk->reason($dto->data);
                foreach ($this->allocations->lockedAllocations($dispatch)->where('additional_issue_id', $issue->id)->where('status', 'reserved') as $row) {
                    $row->update(['status' => 'cancelled']);
                }
                $issue->update(['status' => 'cancelled', 'cancellation_reason' => $reason, 'cancelled_at' => now(), 'cancelled_by_user_id' => $dto->actorId]);
            }
            $this->bulk->completeOperation($dispatch, $dto->actorId, $operation, $dto->data);
            $this->ledger->audit($dispatch, $dto->actorId, ucfirst($command).' bulk additional issue',
                ['additional_issue' => $before], ['additional_issue' => $issue->fresh()->toArray(), 'allocations' => $this->allocations->balances($dispatch)]);

            return $issue->fresh();
        });
    }
}
