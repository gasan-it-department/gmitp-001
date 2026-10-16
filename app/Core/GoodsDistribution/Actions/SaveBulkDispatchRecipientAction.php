<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Dto\BulkDispatchRecipientDto;
use App\Core\GoodsDistribution\Enums\BulkRecipientAcknowledgement;
use App\Core\GoodsDistribution\Enums\BulkRecipientStatus;
use App\Core\GoodsDistribution\Models\BulkDispatchRecipient;
use App\Core\GoodsDistribution\Services\BulkDispatchAllocationService;
use App\Core\GoodsDistribution\Services\BulkDispatchRecipientService;
use App\Core\GoodsDistribution\Services\BulkDispatchService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use App\Core\GoodsDistribution\Services\StockQuantityService;
use Illuminate\Support\Facades\DB;

final class SaveBulkDispatchRecipientAction
{
    public function __construct(private readonly BulkDispatchService $bulk, private readonly BulkDispatchRecipientService $recipients,
        private readonly BulkDispatchAllocationService $allocations, private readonly StockLedgerService $ledger, private readonly StockQuantityService $quantities) {}

    public function execute(BulkDispatchRecipientDto $dto, string $command = 'create'): BulkDispatchRecipient
    {
        if (! in_array($command, ['create', 'complete', 'correct', 'void'], true)) {
            throw new \DomainException('Unknown recipient command.');
        }
        $this->bulk->actor($dto->municipalId, $dto->actorId, in_array($command, ['correct', 'void'], true) ? 'correct' : 'reconcile');

        return DB::transaction(function () use ($dto, $command) {
            $this->ledger->lockMunicipality($dto->municipalId);
            $dispatch = $this->bulk->record($dto->municipalId, $dto->dispatchId, true);
            abort_unless($this->recipients->schemaReady(), 409, 'Recipient recording migrations are pending.');
            $data = $dto->data;
            $record = $dto->recipientId ? BulkDispatchRecipient::query()->where('municipal_id', $dto->municipalId)
                ->where('bulk_dispatch_id', $dispatch->id)->whereKey($dto->recipientId)->lockForUpdate()->firstOrFail() : null;
            if ($command === 'create') {
                $key = $data['submission_key'] ?? '';
                if (! is_string($key) || trim($key) === '' || strlen($key) > 100) {
                    throw new \DomainException('Provide a submission key.');
                }
                $existing = BulkDispatchRecipient::query()->where('municipal_id', $dto->municipalId)->where('submission_key', $key)->first();
                if ($existing) {
                    if ($existing->bulk_dispatch_id !== $dispatch->id || $existing->submission_hash !== $this->bulk->hash([$dto->actorId, $dispatch->id, $data])) {
                        throw new \DomainException('Submission key was used with different recipient details.');
                    }

                    return $existing->load('lines');
                }
            } elseif ($record && $this->bulk->operation($dispatch, $dto->actorId, 'recipient-'.$command.':'.$record->id, $data)) {
                return $record->load('lines');
            }
            $this->bulk->version($dispatch, (int) ($data['version'] ?? 0));
            if (! in_array($dispatch->status->value, ['dispatched', 'closed'], true)) {
                throw new \DomainException('Record recipients after the goods have departed.');
            }
            if ($record && ($record->status !== BulkRecipientStatus::Active || $record->version !== (int) ($data['recipient_version'] ?? 0))) {
                throw new \DomainException('This recipient entry changed or was voided. Refresh its details.');
            }
            $reason = in_array($command, ['correct', 'void'], true) ? $this->bulk->reason($data) : null;
            $before = $record ? [...$record->toArray(), 'lines' => $record->lines()->get()->toArray()] : [];
            if ($command === 'void') {
                $record->update(['status' => BulkRecipientStatus::Voided, 'version' => $record->version + 1,
                    'void_reason' => $reason, 'voided_at' => now(), 'voided_by_user_id' => $dto->actorId, 'updated_by_user_id' => $dto->actorId]);
            } else {
                $headers = [];
                $limits = ['first_name' => 255, 'middle_name' => 255, 'last_name' => 255, 'suffix' => 255,
                    'barangay' => 150, 'purok' => 255, 'collector_name' => 255, 'collector_relationship' => 150,
                    'paper_reference' => 150, 'paper_row' => 50, 'acknowledgement' => 24, 'remarks' => 2000, 'received_on' => 10];
                foreach ($limits as $field => $limit) {
                    if (! array_key_exists($field, $data)) {
                        continue;
                    }
                    if ($data[$field] !== null && ! is_string($data[$field])) {
                        throw new \DomainException('Recipient fields must contain text.');
                    }
                    $value = trim($data[$field] ?? '');
                    $value = $value === '' ? null : $value;
                    if ($value !== null && mb_strlen($value) > $limit) {
                        throw new \DomainException('Recipient field exceeds its maximum length.');
                    }
                    if ($command === 'complete' && $record->getRawOriginal($field) !== null && $value !== $record->getRawOriginal($field)) {
                        throw new \DomainException('Use a reviewed correction to change recorded recipient details.');
                    }
                    $headers[$field] = $value;
                }
                $nameParts = [];
                foreach (['first_name', 'middle_name', 'last_name', 'suffix'] as $field) {
                    $value = array_key_exists($field, $headers) ? $headers[$field] : $record?->{$field};
                    if (in_array($field, ['first_name', 'last_name'], true) && ! filled($value)) {
                        throw new \DomainException('Enter the intended recipient first and last name.');
                    }
                    $nameParts[] = $value;
                }
                $headers['normalized_name'] = $this->recipients->normalizeName(implode(' ', array_filter($nameParts, fn ($part) => filled($part))));
                if (($headers['acknowledgement'] ?? null) !== null && ! BulkRecipientAcknowledgement::tryFrom($headers['acknowledgement'])) {
                    throw new \DomainException('Select signature, thumbmark or not recorded.');
                }
                if (($headers['received_on'] ?? null) !== null) {
                    $headers['received_on'] = $this->allocations->eventDate($headers['received_on'], $dispatch->actual_dispatch_on->toDateString());
                }
                $issued = $this->recipients->issuedLines($dispatch)->keyBy('id');
                $old = $record ? $record->lines()->get()->keyBy('bulk_dispatch_line_id') : collect();
                $inputs = $data['lines'] ?? $old->map(fn ($line) => ['bulk_dispatch_line_id' => $line->bulk_dispatch_line_id, 'quantity' => $line->quantity])->values()->all();
                if (! is_array($inputs) || count($inputs) > 100 || count(array_unique(array_column($inputs, 'bulk_dispatch_line_id'))) !== count($inputs)) {
                    throw new \DomainException('Select distinct issued goods lines.');
                }
                $new = [];
                foreach ($inputs as $input) {
                    $line = $issued->get($input['bulk_dispatch_line_id'] ?? '');
                    if (! $line) {
                        throw new \DomainException('Select goods actually issued on this dispatch.');
                    }
                    $amount = $this->quantities->parse((string) ($input['quantity'] ?? ''), $line->base_unit);
                    if ($amount < 1 || $amount > StockQuantityService::MAX) {
                        throw new \DomainException('Enter a positive documented quantity or omit the item.');
                    }
                    $new[$line->id] = $this->quantities->format($amount);
                }
                if ($command === 'complete') {
                    foreach ($old as $id => $line) {
                        if (($new[$id] ?? null) !== $line->quantity) {
                            throw new \DomainException('Use a reviewed correction to change or remove recorded quantities.');
                        }
                    }
                }
                foreach ($this->recipients->coverage($dispatch) as $row) {
                    $id = $row['bulk_dispatch_line_id'];
                    $previous = $this->quantities->parse($row['recorded'], $row['base_unit']);
                    $next = $previous - ($old->has($id) ? $this->quantities->parse($old[$id]->quantity, $row['base_unit']) : 0)
                        + $this->quantities->parse($new[$id] ?? '0', $row['base_unit']);
                    if ($next > $this->quantities->parse($row['reported_distributed'], $row['base_unit']) && $next > $previous) {
                        throw new \DomainException('Recipient quantities exceed reported distributed totals for '.$row['item_name'].'.');
                    }
                }
                if (! $record) {
                    $record = BulkDispatchRecipient::create([...$headers, 'municipal_id' => $dto->municipalId, 'bulk_dispatch_id' => $dispatch->id,
                        'version' => 1, 'status' => BulkRecipientStatus::Active,
                        'submission_key' => $data['submission_key'], 'submission_hash' => $this->bulk->hash([$dto->actorId, $dispatch->id, $data]),
                        'created_by_user_id' => $dto->actorId, 'updated_by_user_id' => $dto->actorId]);
                } else {
                    $record->update([...$headers, 'version' => $record->version + 1, 'updated_by_user_id' => $dto->actorId]);
                }
                foreach ($old as $id => $line) {
                    if (($new[$id] ?? null) !== $line->quantity) {
                        $line->update(['is_active' => false]);
                    }
                }
                foreach ($new as $id => $amount) {
                    if ($old->has($id) && $old[$id]->quantity === $amount) {
                        continue;
                    }
                    $issuedLine = $issued[$id];
                    $record->allLines()->create(['municipal_id' => $dto->municipalId, 'bulk_dispatch_id' => $dispatch->id,
                        'bulk_dispatch_line_id' => $id, 'item_id' => $issuedLine->item_id, 'item_name_snapshot' => $issuedLine->item_name_snapshot,
                        'item_code_snapshot' => $issuedLine->item_code_snapshot, 'base_unit' => $issuedLine->base_unit,
                        'quantity' => $amount, 'revision' => $record->version]);
                }
            }
            if ($command === 'create') {
                $dispatch->update(['version' => $dispatch->version + 1]);
            } else {
                $this->bulk->completeOperation($dispatch, $dto->actorId, 'recipient-'.$command.':'.$record->id, $data);
            }
            $this->ledger->audit($dispatch, $dto->actorId, ucfirst($command).' bulk recipient entry', ['recipient' => $before],
                ['recipient' => [...$record->fresh()->toArray(), 'lines' => $record->lines()->get()->toArray()], 'reason' => $reason]);

            return $record->fresh()->load('lines');
        });
    }
}
