<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Dto\BulkDispatchDto;
use App\Core\GoodsDistribution\Enums\BulkCustodianType;
use App\Core\GoodsDistribution\Enums\BulkDispatchPurpose;
use App\Core\GoodsDistribution\Enums\BulkDispatchStatus;
use App\Core\GoodsDistribution\Models\BulkDispatch;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\ProgramItem;
use App\Core\GoodsDistribution\Models\StorageLocation;
use App\Core\GoodsDistribution\Services\BulkDispatchService;
use App\Core\GoodsDistribution\Services\DistributionReferenceService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use App\Core\GoodsDistribution\Services\StockQuantityService;
use App\Core\Users\Models\User;
use Illuminate\Support\Facades\DB;

final class SaveBulkDispatchAction
{
    public function __construct(private readonly BulkDispatchService $bulk, private readonly StockLedgerService $ledger, private readonly StockQuantityService $quantities, private readonly DistributionReferenceService $references) {}

    public function execute(BulkDispatchDto $dto): BulkDispatch
    {
        $this->bulk->actor($dto->municipalId, $dto->actorId, 'prepare');

        return DB::transaction(function () use ($dto) {
            $this->ledger->lockMunicipality($dto->municipalId);
            $data = $dto->data;
            $dispatch = $dto->dispatchId ? $this->bulk->record($dto->municipalId, $dto->dispatchId, true) : null;
            if (! $dispatch) {
                if (! filled($data['submission_key'] ?? null) || strlen($data['submission_key']) > 100) {
                    throw new \DomainException('Provide a submission key.');
                }
                $existing = BulkDispatch::query()->where('municipal_id', $dto->municipalId)->where('submission_key', $data['submission_key'])->first();
                if ($existing) {
                    if ($existing->submission_hash !== $this->bulk->hash([$dto->actorId, $data])) {
                        throw new \DomainException('Submission key was already used with different dispatch details.');
                    }

                    return $existing;
                }
            } else {
                if ($this->bulk->operation($dispatch, $dto->actorId, 'save', $data)) {
                    return $dispatch;
                }
                $this->bulk->version($dispatch, (int) ($data['version'] ?? 0));
                if ($dispatch->status !== BulkDispatchStatus::Draft) {
                    throw new \DomainException('Withdraw approval before editing this dispatch.');
                }
            }
            $program = Program::query()->where('municipal_id', $dto->municipalId)->whereKey($data['program_id'])->where('is_active', true)->firstOrFail();
            $storage = StorageLocation::query()->where('municipal_id', $dto->municipalId)->whereKey($data['storage_location_id'])->where('is_active', true)->firstOrFail();
            if (! BulkCustodianType::tryFrom($data['custodian_type'] ?? '')) {
                throw new \DomainException('Select a valid custodian type.');
            }
            $purpose = trim($data['purpose'] ?? '');
            if ($purpose !== '' && ! BulkDispatchPurpose::tryFrom($purpose)) {
                throw new \DomainException('Select a valid dispatch purpose.');
            }
            $custodianName = trim($data['custodian_name'] ?? '');
            if (filled($data['custodian_user_id'] ?? null)) {
                if ($data['custodian_type'] !== 'staff') {
                    throw new \DomainException('Only staff custodians can link a municipal user.');
                }
                $user = User::query()->where('municipal_id', $dto->municipalId)->whereKey($data['custodian_user_id'])->whereNull('deactivated_at')->firstOrFail();
                $custodianName = trim($user->first_name.' '.$user->last_name);
            }
            $destinations = array_values(array_unique(array_map(fn ($name) => trim((string) $name), $data['destination_barangays'] ?? [])));
            if (count($destinations) > 100 || collect($destinations)->contains(fn ($name) => $name === '' || mb_strlen($name) > 150)) {
                throw new \DomainException('Provide valid destination barangay names.');
            }
            $lines = $data['lines'] ?? [];
            if (count($lines) > 100 || count(array_unique(array_column($lines, 'item_id'))) !== count($lines)) {
                throw new \DomainException('Select distinct items.');
            }
            $before = $dispatch ? [...$dispatch->toArray(), 'lines' => $dispatch->lines->toArray()] : [];
            $attributes = [
                'program_id' => $program->id, 'storage_location_id' => $storage->id, 'program_name_snapshot' => $program->name, 'storage_name_snapshot' => $storage->name,
                'custodian_type' => $data['custodian_type'], 'custodian_user_id' => $data['custodian_user_id'] ?? null,
                'custodian_name' => $custodianName ?: null, 'destination_barangays' => $destinations,
                'purpose' => $purpose === '' ? null : $purpose,
                ...collect(['custodian_role', 'requester_name', 'requester_role', 'location_notes', 'purpose_notes', 'paper_reference'])
                    ->mapWithKeys(fn ($field) => [$field => trim($data[$field] ?? '') ?: null])->all(),
            ];
            if ($dispatch) {
                $this->bulk->completeOperation($dispatch, $dto->actorId, 'save', $data, $attributes);
                $dispatch->allLines()->update(['is_active' => false]);
            } else {
                $dispatch = BulkDispatch::create([...$attributes, 'municipal_id' => $dto->municipalId, 'reference' => $this->references->nextBulkDispatch($dto->municipalId),
                    'submission_key' => $data['submission_key'], 'submission_hash' => $this->bulk->hash([$dto->actorId, $data]), 'created_by_user_id' => $dto->actorId]);
            }
            foreach ($lines as $index => $line) {
                $item = Item::query()->where('municipal_id', $dto->municipalId)->whereKey($line['item_id'])->where('is_active', true)->firstOrFail();
                if (! ProgramItem::query()->where('municipal_id', $dto->municipalId)->where('program_id', $program->id)->where('item_id', $item->id)->where('is_active', true)->exists()) {
                    throw new \DomainException('Select items enabled in this program.');
                }
                $amount = blank($line['quantity'] ?? null) ? null : $this->quantities->parse((string) $line['quantity'], $item->base_unit);
                if ($amount !== null && $amount < 1) {
                    throw new \DomainException('Quantities must be positive. Leave an unknown draft quantity blank.');
                }
                $dispatch->allLines()->create(['municipal_id' => $dto->municipalId, 'item_id' => $item->id, 'item_name_snapshot' => $item->name,
                    'item_code_snapshot' => $item->code, 'base_unit' => $item->base_unit, 'quantity' => $amount === null ? null : $this->quantities->format($amount), 'sort_order' => $index]);
            }
            $this->ledger->audit($dispatch, $dto->actorId, 'Saved bulk dispatch draft', $before, [...$dispatch->fresh()->toArray(), 'lines' => $dispatch->lines()->get()->toArray()]);

            return $dispatch->fresh();
        });
    }
}
