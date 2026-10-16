<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\ActionCenter\Models\DocumentType;
use App\Core\GoodsDistribution\Dto\DistributionRequestDto;
use App\Core\GoodsDistribution\Enums\DistributionStatus;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\ProgramDocumentRequirement;
use App\Core\GoodsDistribution\Models\ProgramItem;
use App\Core\GoodsDistribution\Models\StorageLocation;
use App\Core\GoodsDistribution\Services\DistributionReferenceService;
use App\Core\GoodsDistribution\Services\DistributionRequestService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use App\Core\GoodsDistribution\Services\StockQuantityService;
use Illuminate\Support\Facades\DB;

final class SaveDistributionRequestAction
{
    public function __construct(private readonly DistributionRequestService $requests, private readonly StockLedgerService $ledger, private readonly StockQuantityService $quantities, private readonly DistributionReferenceService $references) {}

    public function execute(DistributionRequestDto $dto): DistributionRequest
    {
        return DB::transaction(function () use ($dto) {
            $this->ledger->lockMunicipality($dto->municipalId);
            $data = $dto->data;
            $request = $dto->requestId ? $this->requests->locked($dto->municipalId, $dto->requestId) : null;
            $capability = $request ? $this->requests->editingCapability($request, $dto->actorId) : 'intake';
            $actor = $this->requests->actor($dto->municipalId, $dto->actorId, 'goods_distribution.requests.'.$capability);
            $intent = $data['intent'] ?? ($request ? 'save' : 'submit');
            if (! in_array($intent, ['draft', 'save', 'submit'], true) || (! $request && $intent === 'save')) {
                throw new \DomainException('Select a valid save action.');
            }
            $draft = $intent === 'draft' || ($intent === 'save' && $request?->status === DistributionStatus::Draft);
            if (! $dto->requestId) {
                $existing = DistributionRequest::query()->where('municipal_id', $dto->municipalId)->where('submission_key', $data['submission_key'])->first();
                if ($existing) {
                    if ($existing->submission_hash !== $this->requests->hash([$dto->actorId, $data])) {
                        throw new \DomainException('Submission key was already used with different request details.');
                    }

                    return $existing;
                }
            }
            if ($request) {
                $this->requests->version($request, (int) $data['version']);
                if (! in_array($request->status, [DistributionStatus::Draft, DistributionStatus::Pending, DistributionStatus::Returned], true)) {
                    throw new \DomainException('Return this request before editing it.');
                }
                if ($request->program_id !== $data['program_id']) {
                    throw new \DomainException('A request cannot change program. Cancel and create another request.');
                }
                if ($request->status !== DistributionStatus::Draft && $intent !== 'save') {
                    throw new \DomainException('Only drafts can use the draft or submit save actions.');
                }
                if ($capability === 'process' && ($request->beneficiary_id !== $data['beneficiary_id']
                    || $request->assisted_household_member_id !== ($data['assisted_household_member_id'] ?? null))) {
                    throw new \Illuminate\Auth\Access\AuthorizationException('Intake permission is required to change the filer or assisted person.');
                }
            }
            $program = Program::query()->where('municipal_id', $dto->municipalId)->whereKey($data['program_id'])->where('is_active', true)->firstOrFail();
            $storage = StorageLocation::query()->where('municipal_id', $dto->municipalId)->whereKey($data['storage_location_id'])->where('is_active', true)->firstOrFail();
            $snapshot = $capability === 'process' ? $request->reviewed_snapshot
                : $this->requests->snapshot($dto->municipalId, $data['beneficiary_id'], $data['assisted_household_member_id'] ?? null);
            $lines = $data['lines'] ?? [];
            if ((! $draft && ! $lines) || count(array_unique(array_column($lines, 'item_id'))) !== count($lines)) {
                throw new \DomainException('Add distinct items to this request.');
            }
            $before = $request ? ['status' => $request->status->value, 'version' => $request->version,
                'snapshot' => $request->reviewed_snapshot, 'lines' => $request->lines->toArray(), 'notes' => $request->notes] : [];
            $attributes = [
                'beneficiary_id' => $data['beneficiary_id'], 'household_id' => $snapshot['household_id'],
                'assisted_household_member_id' => $data['assisted_household_member_id'] ?? null,
                'storage_location_id' => $data['storage_location_id'], 'reviewed_snapshot' => $snapshot, 'notes' => $data['notes'] ?? null,
                'program_name_snapshot' => $program->name, 'storage_name_snapshot' => $storage->name,
            ];
            if (! $request) {
                $request = DistributionRequest::create([...$attributes, 'municipal_id' => $dto->municipalId, 'program_id' => $data['program_id'],
                    'reference' => $this->references->nextRequest($dto->municipalId), 'submission_key' => $data['submission_key'],
                    'submission_hash' => $this->requests->hash([$dto->actorId, $data]), 'filing_snapshot' => $snapshot,
                    'created_by_user_id' => $dto->actorId, 'status' => $draft ? 'draft' : 'pending']);
                foreach (ProgramDocumentRequirement::query()->where('municipal_id', $dto->municipalId)->where('program_id', $request->program_id)->orderBy('sort_order')->get() as $requirement) {
                    $type = DocumentType::query()->availableToMunicipality($dto->municipalId)->whereKey($requirement->document_type_id)->firstOrFail();
                    $request->documentChecks()->create([
                        'municipal_id' => $dto->municipalId, 'document_key' => $type->key, 'label' => $type->label, 'description' => $type->description,
                        'is_required' => $requirement->is_required, 'evidence_mode' => $requirement->evidence_mode,
                        'physical_copy_requirement' => $requirement->physical_copy_requirement, 'sort_order' => $requirement->sort_order,
                    ]);
                }
            } else {
                $request->update([...$attributes, 'version' => $request->version + 1,
                    'cooldown_exception_authorization' => null,
                    ...($request->status === DistributionStatus::Draft && $intent === 'submit' ? ['status' => 'pending'] : [])]);
                if ($before['snapshot']['identity_fingerprint'] !== $snapshot['identity_fingerprint']) {
                    $request->documentChecks()->where('is_active', true)->update(['status' => 'pending', 'inspected_media_id' => null, 'checked_at' => null, 'checked_by_user_id' => null]);
                }
            }
            $request->allLines()->update(['is_active' => false]);
            foreach ($lines as $index => $line) {
                $item = Item::query()->where('municipal_id', $dto->municipalId)->whereKey($line['item_id'])->where('is_active', true)->firstOrFail();
                if (! ProgramItem::query()->where('municipal_id', $dto->municipalId)->where('program_id', $request->program_id)->where('item_id', $item->id)->where('is_active', true)->exists()) {
                    throw new \DomainException('Select items enabled in this program.');
                }
                $quantity = $draft && blank($line['quantity'] ?? null) ? null : $this->quantities->parse((string) ($line['quantity'] ?? ''), $item->base_unit);
                if ($quantity !== null && $quantity < 1) {
                    throw new \DomainException('Request quantities must be positive.');
                }
                $request->allLines()->updateOrCreate(['item_id' => $item->id], [
                    'municipal_id' => $dto->municipalId, 'item_name_snapshot' => $item->name, 'item_code_snapshot' => $item->code,
                    'base_unit' => $item->base_unit, 'quantity' => $quantity === null ? null : $this->quantities->format($quantity), 'sort_order' => $index, 'is_active' => true,
                ]);
            }
            $request->load('lines');
            if (! $draft) {
                $this->requests->assertReady($request);
            }
            $description = $draft ? 'Saved goods request draft' : ($intent === 'submit' ? 'Submitted goods request' : 'Corrected goods request');
            $this->ledger->audit($request, $actor->id, $description, $before,
                ['status' => $request->status->value, 'snapshot' => $snapshot, 'notes' => $request->notes,
                    'storage_name' => $storage->name, 'lines' => $request->lines->toArray()]);

            return $request;
        });
    }
}
