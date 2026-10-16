<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\GoodsDistribution\Enums\BulkCustodianType;
use App\Core\GoodsDistribution\Enums\BulkDispatchPurpose;
use App\Core\GoodsDistribution\Models\BulkDispatch;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\ProgramItem;
use App\Core\GoodsDistribution\Models\StorageLocation;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;

final class BulkDispatchService
{
    public function __construct(private readonly DistributionRequestService $requests, private readonly StockQuantityService $quantities) {}

    public function actor(string $municipalId, string $actorId, string $capability): User
    {
        $actor = $this->requests->actor($municipalId, $actorId, 'goods_distribution.bulk_dispatches.'.$capability);
        if (! $actor->can('goods_distribution.bulk_dispatches.view')
            || ($capability === 'correct' && ! $actor->can('goods_distribution.bulk_dispatches.reconcile')) || $actor->deactivated_at) {
            throw new AuthorizationException('You cannot perform this bulk dispatch action.');
        }

        return $actor;
    }

    public function record(string $municipalId, string $id, bool $lock = false): BulkDispatch
    {
        return BulkDispatch::query()->where('municipal_id', $municipalId)->whereKey($id)
            ->when($lock, fn ($query) => $query->lockForUpdate())->firstOrFail();
    }

    public function version(BulkDispatch $dispatch, int $version): void
    {
        if ($dispatch->version !== $version) {
            throw new \DomainException('This dispatch changed. Refresh and review the latest version.');
        }
    }

    public function hash(array $data): string
    {
        return hash('sha256', json_encode($data, JSON_THROW_ON_ERROR));
    }

    public function operation(BulkDispatch $dispatch, string $actorId, string $command, array $data): bool
    {
        $key = $data['operation_key'] ?? '';
        if (! is_string($key) || trim($key) === '' || strlen($key) > 100) {
            throw new \DomainException('Provide a valid operation key.');
        }
        $hash = $this->hash([$actorId, $command, $data]);
        $previous = ($dispatch->operations ?? [])[$key] ?? null;
        if ($previous !== null && $previous !== $hash) {
            throw new \DomainException('Operation key was already used with different dispatch details.');
        }

        return $previous !== null;
    }

    public function completeOperation(BulkDispatch $dispatch, string $actorId, string $command, array $data, array $attributes = []): void
    {
        $operations = $dispatch->operations ?? [];
        $operations[$data['operation_key']] = $this->hash([$actorId, $command, $data]);
        $dispatch->update([...$attributes, 'version' => $dispatch->version + 1, 'operations' => $operations]);
    }

    public function reason(array $data): string
    {
        $reason = trim($data['reason'] ?? '');
        if (mb_strlen($reason) < 10 || mb_strlen($reason) > 2000) {
            throw new \DomainException('Provide a reason between 10 and 2,000 characters.');
        }

        return $reason;
    }

    public function readySnapshot(BulkDispatch $dispatch): array
    {
        $program = Program::query()->where('municipal_id', $dispatch->municipal_id)->whereKey($dispatch->program_id)->where('is_active', true)->firstOrFail();
        $storage = StorageLocation::query()->where('municipal_id', $dispatch->municipal_id)->whereKey($dispatch->storage_location_id)->where('is_active', true)->firstOrFail();
        $custodian = $dispatch->custodian_name;
        if ($dispatch->custodian_user_id) {
            if ($dispatch->custodian_type !== 'staff') {
                throw new \DomainException('Only staff custodians can link a municipal user.');
            }
            $user = User::query()->where('municipal_id', $dispatch->municipal_id)->whereKey($dispatch->custodian_user_id)->whereNull('deactivated_at')->firstOrFail();
            $custodian = trim($user->first_name.' '.$user->last_name);
        }
        $custodianType = BulkCustodianType::tryFrom($dispatch->custodian_type);
        $purpose = BulkDispatchPurpose::tryFrom($dispatch->purpose ?? '');
        if (! $custodianType || ! filled($custodian)
            || ! filled($dispatch->custodian_role) || ! $purpose || ! count($dispatch->destination_barangays ?? [])) {
            throw new \DomainException('Complete the custodian, role, purpose and destination barangays before approval.');
        }
        if (in_array(mb_strtolower(trim($custodian)), ['none', 'n/a', 'na', 'n.a.'], true)) {
            throw new \DomainException('Enter the actual responsible custodian name before approval.');
        }
        if ($purpose === BulkDispatchPurpose::Other && ! filled($dispatch->purpose_notes)) {
            throw new \DomainException('Describe the purpose before approving an Other dispatch.');
        }
        if ($purpose === BulkDispatchPurpose::SchoolDistribution && ! filled($dispatch->location_notes)) {
            throw new \DomainException('Enter the school name in Venue / Specific location before approval.');
        }
        $dispatch->load('lines');
        if ($dispatch->lines->isEmpty()) {
            throw new \DomainException('Add goods before approval.');
        }
        foreach ($dispatch->lines as $line) {
            $item = Item::query()->where('municipal_id', $dispatch->municipal_id)->whereKey($line->item_id)->where('is_active', true)->firstOrFail();
            if (! ProgramItem::query()->where('municipal_id', $dispatch->municipal_id)->where('program_id', $dispatch->program_id)->where('item_id', $line->item_id)->where('is_active', true)->exists()
                || $line->base_unit !== $item->base_unit || $line->quantity === null || $this->quantities->parse($line->quantity, $line->base_unit) < 1) {
                throw new \DomainException('Complete quantities and use active items enabled in this program.');
            }
        }

        return [
            'program_name' => $program->name, 'storage_name' => $storage->name, 'custodian_name' => $custodian,
            'custodian_type' => $dispatch->custodian_type, 'custodian_user_id' => $dispatch->custodian_user_id, 'custodian_role' => $dispatch->custodian_role,
            'custodian_type_label' => $custodianType->label(),
            'requester_name' => $dispatch->requester_name, 'requester_role' => $dispatch->requester_role,
            'destination_barangays' => $dispatch->destination_barangays, 'location_notes' => $dispatch->location_notes,
            'purpose' => $dispatch->purpose, 'purpose_label' => $purpose->label(), 'purpose_notes' => $dispatch->purpose_notes, 'paper_reference' => $dispatch->paper_reference,
            'lines' => $dispatch->lines->map(fn ($line) => $line->only(['id', 'item_id', 'item_name_snapshot', 'item_code_snapshot', 'base_unit', 'quantity']))->values()->all(),
        ];
    }
}
