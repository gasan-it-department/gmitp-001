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
use App\Core\GoodsDistribution\Services\DistributionRequestService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use App\Core\GoodsDistribution\Services\StockQuantityService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class SaveDistributionRequestAction
{
    public function __construct(private readonly DistributionRequestService $requests, private readonly StockLedgerService $ledger, private readonly StockQuantityService $quantities) {}

    public function execute(DistributionRequestDto $dto): DistributionRequest
    {
        $actor = $this->requests->actor($dto->municipalId, $dto->actorId, 'goods_distribution.requests.intake');

        return DB::transaction(function () use ($dto, $actor) {
            $this->ledger->lockMunicipality($dto->municipalId);
            $data = $dto->data;
            if (! $dto->requestId) {
                $existing = DistributionRequest::query()->where('municipal_id', $dto->municipalId)->where('submission_key', $data['submission_key'])->first();
                if ($existing) {
                    if ($existing->submission_hash !== $this->requests->hash([$dto->actorId, $data])) {
                        throw new \DomainException('Submission key was already used with different request details.');
                    }

                    return $existing;
                }
            }
            $request = $dto->requestId ? $this->requests->locked($dto->municipalId, $dto->requestId) : null;
            if ($request) {
                $this->requests->version($request, (int) $data['version']);
                if (! in_array($request->status, [DistributionStatus::Pending, DistributionStatus::Returned], true)) {
                    throw new \DomainException('Return this request before editing it.');
                }
                if ($request->program_id !== $data['program_id']) {
                    throw new \DomainException('A request cannot change program. Cancel and create another request.');
                }
            }
            $program = Program::query()->where('municipal_id', $dto->municipalId)->whereKey($data['program_id'])->where('is_active', true)->firstOrFail();
            $storage = StorageLocation::query()->where('municipal_id', $dto->municipalId)->whereKey($data['storage_location_id'])->where('is_active', true)->firstOrFail();
            $snapshot = $this->requests->snapshot($dto->municipalId, $data['beneficiary_id'], $data['assisted_household_member_id'] ?? null);
            if (! $data['lines'] || count(array_unique(array_column($data['lines'], 'item_id'))) !== count($data['lines'])) {
                throw new \DomainException('Add distinct items to this request.');
            }
            $before = $request ? ['snapshot' => $request->reviewed_snapshot, 'lines' => $request->lines->toArray(), 'notes' => $request->notes] : [];
            $attributes = [
                'beneficiary_id' => $data['beneficiary_id'], 'household_id' => $snapshot['household_id'],
                'assisted_household_member_id' => $data['assisted_household_member_id'] ?? null,
                'storage_location_id' => $data['storage_location_id'], 'reviewed_snapshot' => $snapshot, 'notes' => $data['notes'] ?? null,
                'program_name_snapshot' => $program->name, 'storage_name_snapshot' => $storage->name,
            ];
            if (! $request) {
                $request = DistributionRequest::create([...$attributes, 'municipal_id' => $dto->municipalId, 'program_id' => $data['program_id'],
                    'reference' => 'GD-'.Str::upper((string) Str::ulid()), 'submission_key' => $data['submission_key'],
                    'submission_hash' => $this->requests->hash([$dto->actorId, $data]), 'filing_snapshot' => $snapshot,
                    'created_by_user_id' => $dto->actorId, 'status' => 'pending']);
                foreach (ProgramDocumentRequirement::query()->where('municipal_id', $dto->municipalId)->where('program_id', $request->program_id)->orderBy('sort_order')->get() as $requirement) {
                    $type = DocumentType::query()->availableToMunicipality($dto->municipalId)->whereKey($requirement->document_type_id)->firstOrFail();
                    $request->documentChecks()->create([
                        'municipal_id' => $dto->municipalId, 'document_key' => $type->key, 'label' => $type->label, 'description' => $type->description,
                        'is_required' => $requirement->is_required, 'evidence_mode' => $requirement->evidence_mode,
                        'physical_copy_requirement' => $requirement->physical_copy_requirement, 'sort_order' => $requirement->sort_order,
                    ]);
                }
            } else {
                $request->update([...$attributes, 'version' => $request->version + 1]);
                if ($before['snapshot']['identity_fingerprint'] !== $snapshot['identity_fingerprint']) {
                    $request->documentChecks()->update(['status' => 'pending', 'inspected_media_id' => null, 'checked_at' => null, 'checked_by_user_id' => null]);
                }
            }
            $request->allLines()->update(['is_active' => false]);
            foreach ($data['lines'] as $index => $line) {
                $item = Item::query()->where('municipal_id', $dto->municipalId)->whereKey($line['item_id'])->where('is_active', true)->firstOrFail();
                if (! ProgramItem::query()->where('municipal_id', $dto->municipalId)->where('program_id', $request->program_id)->where('item_id', $item->id)->where('is_active', true)->exists()) {
                    throw new \DomainException('Select items enabled in this program.');
                }
                $quantity = $this->quantities->parse((string) $line['quantity'], $item->base_unit);
                if ($quantity < 1) {
                    throw new \DomainException('Request quantities must be positive.');
                }
                $request->allLines()->updateOrCreate(['item_id' => $item->id], [
                    'municipal_id' => $dto->municipalId, 'item_name_snapshot' => $item->name, 'item_code_snapshot' => $item->code,
                    'base_unit' => $item->base_unit, 'quantity' => $this->quantities->format($quantity), 'sort_order' => $index, 'is_active' => true,
                ]);
            }
            $request->load('lines');
            $this->ledger->audit($request, $actor->id, $before ? 'Corrected goods request' : 'Submitted goods request', $before,
                ['status' => $request->status->value, 'snapshot' => $snapshot, 'notes' => $request->notes,
                    'storage_name' => $storage->name, 'lines' => $request->lines->toArray()]);

            return $request;
        });
    }
}
