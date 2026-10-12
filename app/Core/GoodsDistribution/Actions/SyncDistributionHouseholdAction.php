<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Dto\DistributionRequestDto;
use App\Core\GoodsDistribution\Enums\DistributionStatus as Status;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Services\DistributionHouseholdService;
use App\Core\GoodsDistribution\Services\DistributionRequestService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use Illuminate\Support\Facades\DB;

final class SyncDistributionHouseholdAction
{
    public function __construct(private readonly DistributionRequestService $requests, private readonly DistributionHouseholdService $households,
        private readonly StockLedgerService $ledger) {}

    public function execute(DistributionRequestDto $dto): DistributionRequest
    {
        return DB::transaction(function () use ($dto) {
            $this->ledger->lockMunicipality($dto->municipalId);
            $request = $this->requests->locked($dto->municipalId, $dto->requestId);
            $permission = $request->status === Status::UnderReview ? 'process' : 'intake';
            $this->requests->actor($dto->municipalId, $dto->actorId, 'goods_distribution.requests.'.$permission);
            $data = $dto->data;
            $hash = $this->requests->hash([$dto->actorId, 'sync-household', $data]);
            $previous = ($request->operations ?? [])[$data['operation_key']] ?? null;
            if ($previous) {
                if ($previous !== $hash) {
                    throw new \DomainException('Operation key was already used with different details.');
                }

                return $request;
            }
            $this->requests->version($request, (int) $data['version']);
            if (! in_array($request->status, [Status::Pending, Status::Returned, Status::UnderReview], true)) {
                throw new \DomainException('Only pending, returned, or under-review requests can sync. Return approved requests for correction first.');
            }
            if ($request->allocations()->where('status', 'reserved')->exists()) {
                throw new \DomainException('Resolve existing stock reservations before syncing this request.');
            }
            if (! ($data['household_reviewed'] ?? false)) {
                throw new \DomainException('Confirm that you reviewed the household changes before syncing.');
            }
            $preview = $this->households->preview($request);
            if ($preview['error']) {
                throw new \DomainException($preview['error']);
            }
            if (! hash_equals($preview['fingerprint'], $data['registry_fingerprint'] ?? '')) {
                throw new \DomainException('The registry changed after your preview. Refresh and review the household again.');
            }
            if (! $preview['changed']) {
                throw new \DomainException('The saved household is already up to date.');
            }
            $checks = fn () => $request->documentChecks()->orderBy('id')->get()->map->only(['id', 'status', 'inspected_media_id', 'checked_at', 'checked_by_user_id'])->all();
            $before = ['status' => $request->status->value, 'version' => $request->version, 'snapshot' => $request->reviewed_snapshot, 'document_checks' => $checks()];
            if ($preview['identity_changed']) {
                $request->documentChecks()->update(['status' => 'pending', 'inspected_media_id' => null, 'checked_at' => null, 'checked_by_user_id' => null]);
            }
            $request->update(['household_id' => $preview['snapshot']['household_id'], 'reviewed_snapshot' => $preview['snapshot'],
                'version' => $request->version + 1, 'operations' => [...($request->operations ?? []), $data['operation_key'] => $hash]]);
            $this->ledger->audit($request, $dto->actorId, 'Synced goods request household', $before,
                ['status' => $request->status->value, 'version' => $request->version, 'snapshot' => $request->reviewed_snapshot,
                    'household_reviewed' => true, 'document_checks' => $checks(), 'document_checks_reset' => $preview['identity_changed']]);

            return $request;
        });
    }
}
