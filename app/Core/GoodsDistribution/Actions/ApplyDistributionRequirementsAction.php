<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Dto\DistributionRequestDto;
use App\Core\GoodsDistribution\Enums\AllocationStatus;
use App\Core\GoodsDistribution\Enums\DistributionStatus as Status;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Services\DistributionRequestService;
use App\Core\GoodsDistribution\Services\DistributionRequirementsService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use Illuminate\Support\Facades\DB;

final class ApplyDistributionRequirementsAction
{
    public function __construct(private readonly DistributionRequestService $requests, private readonly DistributionRequirementsService $requirements,
        private readonly StockLedgerService $ledger) {}

    public function execute(DistributionRequestDto $dto): DistributionRequest
    {
        return DB::transaction(function () use ($dto) {
            $this->ledger->lockMunicipality($dto->municipalId);
            $request = $this->requests->locked($dto->municipalId, $dto->requestId);
            $this->requests->actor($dto->municipalId, $dto->actorId, 'goods_distribution.requests.'.$this->requests->editingCapability($request, $dto->actorId));
            if (! in_array($request->status, [Status::Draft, Status::Pending, Status::Returned, Status::UnderReview], true)) {
                throw new \DomainException('Only draft, pending, returned, or under-review requests can update requirements. Return approved requests for correction first.');
            }
            if ($request->allocations()->where('status', AllocationStatus::Reserved->value)->exists()) {
                throw new \DomainException('Resolve existing stock reservations before updating requirements.');
            }
            $data = $dto->data;
            $hash = $this->requests->hash([$dto->actorId, 'apply-requirements', $data]);
            $previous = ($request->operations ?? [])[$data['operation_key']] ?? null;
            if ($previous) {
                if ($previous !== $hash) {
                    throw new \DomainException('Operation key was already used with different details.');
                }

                return $request;
            }
            $this->requests->version($request, (int) $data['version']);
            if (! ($data['changes_reviewed'] ?? false)) {
                throw new \DomainException('Confirm that you reviewed the document requirement changes.');
            }
            $preview = $this->requirements->preview($request);
            if ($preview['error']) {
                throw new \DomainException($preview['error']);
            }
            if (! hash_equals($preview['fingerprint'], $data['requirements_fingerprint'] ?? '')) {
                throw new \DomainException('Program requirements changed after your preview. Refresh and review the changes again.');
            }
            if (! $preview['changed']) {
                return $request;
            }
            $snapshot = fn () => $request->documentChecks()->orderBy('id')->get()->map->only([
                'id', ...DistributionRequirementsService::FIELDS, 'is_active', 'status', 'current_media_id', 'inspected_media_id',
                'presented_copy_type', 'remarks', 'checked_at', 'checked_by_user_id',
            ])->all();
            $before = ['version' => $request->version, 'documents' => $snapshot()];
            foreach ($preview['changes'] as $change) {
                $check = $request->documentChecks()->where('document_key', $change['document_key'])->first();
                if ($change['kind'] === 'removed') {
                    $check->update(['is_active' => false]);

                    continue;
                }
                $attributes = [...$change['after'], 'is_active' => true];
                if ($change['resets_inspection']) {
                    $attributes = [...$attributes, 'status' => 'pending', 'inspected_media_id' => null,
                        'checked_at' => null, 'checked_by_user_id' => null, 'remarks' => null];
                    if ($attributes['evidence_mode'] === 'upload') {
                        $attributes['presented_copy_type'] = null;
                    }
                }
                if ($check) {
                    $check->update($attributes);
                } else {
                    $request->documentChecks()->create(['municipal_id' => $dto->municipalId, ...$attributes]);
                }
            }
            $request->update(['version' => $request->version + 1, 'operations' => [...($request->operations ?? []), $data['operation_key'] => $hash]]);
            $this->ledger->audit($request, $dto->actorId, 'Applied updated goods document requirements', $before,
                ['version' => $request->version, 'documents' => $snapshot(), 'changes' => $preview['changes'],
                    'requirements_fingerprint' => $preview['fingerprint'], 'changes_reviewed' => true]);

            return $request;
        });
    }
}
