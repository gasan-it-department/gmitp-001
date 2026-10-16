<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\GoodsDistribution\Models\BulkDispatch;
use App\Core\GoodsDistribution\Models\BulkDispatchAdditionalIssue;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\ProgramItem;
use App\Core\GoodsDistribution\Models\StorageLocation;
use App\Core\Users\Models\User;
use Illuminate\Support\Facades\Schema;

final class BulkAdditionalIssueService
{
    public function __construct(private readonly BulkDispatchService $bulk, private readonly BulkDispatchAllocationService $allocations, private readonly StockQuantityService $quantities) {}

    public function schemaReady(): bool
    {
        return Schema::hasTable('gd_bulk_dispatch_additional_issues') && Schema::hasColumn('gd_bulk_dispatch_stock_allocations', 'additional_issue_id');
    }

    public function record(BulkDispatch $dispatch, string $id, bool $lock = false): BulkDispatchAdditionalIssue
    {
        return BulkDispatchAdditionalIssue::query()->where('municipal_id', $dispatch->municipal_id)->where('bulk_dispatch_id', $dispatch->id)
            ->whereKey($id)->when($lock, fn ($query) => $query->lockForUpdate())->firstOrFail();
    }

    public function validateLines(BulkDispatch $dispatch, array $lines): array
    {
        if (! Program::query()->where('municipal_id', $dispatch->municipal_id)->whereKey($dispatch->program_id)->where('is_active', true)->exists()
            || ! StorageLocation::query()->where('municipal_id', $dispatch->municipal_id)->whereKey($dispatch->storage_location_id)->where('is_active', true)->exists()) {
            throw new \DomainException('Additional goods require an active program and storage location.');
        }
        $this->validateCustodian($dispatch);
        if (! $lines || count($lines) > 100 || count(array_unique(array_column($lines, 'item_id'))) !== count($lines)) {
            throw new \DomainException('Enter between one and 100 distinct additional goods.');
        }
        $result = [];
        foreach ($lines as $line) {
            $item = Item::query()->where('municipal_id', $dispatch->municipal_id)->whereKey($line['item_id'] ?? '')->where('is_active', true)->firstOrFail();
            if (! ProgramItem::query()->where('municipal_id', $dispatch->municipal_id)->where('program_id', $dispatch->program_id)
                ->where('item_id', $item->id)->where('is_active', true)->exists()) {
                throw new \DomainException('Use active items enabled in this dispatch program.');
            }
            if (isset($line['base_unit']) && $line['base_unit'] !== $item->base_unit) {
                throw new \DomainException('An item unit changed. Cancel this additional issue and review it again.');
            }
            $quantity = $this->quantities->parse((string) ($line['quantity'] ?? ''), $item->base_unit);
            if ($quantity < 1) {
                throw new \DomainException('Additional quantities must be greater than zero.');
            }
            $result[] = ['item_id' => $item->id, 'item_name_snapshot' => $line['item_name_snapshot'] ?? $item->name,
                'item_code_snapshot' => $line['item_code_snapshot'] ?? $item->code, 'base_unit' => $item->base_unit,
                'quantity' => $this->quantities->format($quantity)];
        }

        return $result;
    }

    public function validateCustodian(BulkDispatch $dispatch): void
    {
        if ($dispatch->custodian_user_id && ! User::query()->where('municipal_id', $dispatch->municipal_id)
            ->whereKey($dispatch->custodian_user_id)->whereNull('deactivated_at')->exists()) {
            throw new \DomainException('The responsible custodian is no longer available. Use a new dispatch with an active custodian.');
        }
    }

    public function preview(BulkDispatch $dispatch, BulkDispatchAdditionalIssue $issue, bool $lock = false): array
    {
        if ($dispatch->status->value !== 'dispatched' || $issue->status->value !== 'pending') {
            throw new \DomainException('Review a pending additional issue on an active dispatched record.');
        }
        $lines = $this->validateLines($dispatch, $issue->lines_snapshot);
        $entries = $this->allocations->propose($dispatch, $lines, $lock);

        return ['allocations' => $entries, 'fingerprint' => $this->bulk->hash([$dispatch->id, $dispatch->version, $issue->id, $issue->reason, $lines, $entries])];
    }
}
