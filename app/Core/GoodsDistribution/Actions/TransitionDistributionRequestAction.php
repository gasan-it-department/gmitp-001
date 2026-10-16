<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\ActionCenter\Enums\PhysicalCopyRequirement;
use App\Core\GoodsDistribution\Dto\DistributionRequestDto;
use App\Core\GoodsDistribution\Enums\DistributionStatus as Status;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Services\DistributionAllocationService;
use App\Core\GoodsDistribution\Services\DistributionCooldownService;
use App\Core\GoodsDistribution\Services\DistributionRequestService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

final class TransitionDistributionRequestAction
{
    public function __construct(private readonly DistributionRequestService $requests, private readonly DistributionAllocationService $allocations, private readonly StockLedgerService $ledger, private readonly DistributionCooldownService $cooldowns) {}

    public function execute(DistributionRequestDto $dto, string $command): DistributionRequest
    {
        return DB::transaction(function () use ($dto, $command) {
            $this->ledger->lockMunicipality($dto->municipalId);
            $request = $this->requests->locked($dto->municipalId, $dto->requestId);
            $permission = match ($command) {
                'submit' => \App\Core\Users\Models\User::findOrFail($dto->actorId)->can('goods_distribution.requests.intake') ? 'intake' : 'process',
                'review' => 'process', 'resubmit' => 'intake', 'release' => 'release',
                'return' => $request->status === Status::Approved || \App\Core\Users\Models\User::findOrFail($dto->actorId)->can('goods_distribution.requests.decide') ? 'decide' : 'process',
                'approve', 'cancel', 'authorize_cooldown' => 'decide', default => throw new \DomainException('Unknown goods workflow command.'),
            };
            $this->requests->actor($dto->municipalId, $dto->actorId, 'goods_distribution.requests.'.$permission);
            $data = $dto->data;
            $hash = $this->requests->hash([$dto->actorId, $command, $data]);
            $previous = ($request->operations ?? [])[$data['operation_key']] ?? null;
            if ($previous) {
                if ($previous !== $hash) {
                    throw new \DomainException('Operation key was already used with different details.');
                }

                return $request;
            }
            $this->requests->version($request, (int) $data['version']);
            if ($request->status->terminal()) {
                throw new \DomainException('Finalized goods requests cannot be changed.');
            }
            $before = ['status' => $request->status->value, 'version' => $request->version, 'allocations' => $request->allocations()->get()->toArray(),
                'cooldown_policy' => $request->cooldown_policy, 'cooldown_exception_authorization' => $request->cooldown_exception_authorization];
            $attributes = [];
            switch ($command) {
                case 'submit':
                    if ($request->status !== Status::Draft) {
                        throw new \DomainException('Only drafts can be submitted for review.');
                    }
                    $this->requests->assertReady($request);
                    $attributes = ['status' => 'pending'];
                    break;
                case 'review':
                    if ($request->status !== Status::Pending) {
                        throw new \DomainException('Only pending requests can start review.');
                    }
                    $this->requests->assertReady($request, false);
                    $attributes = ['status' => 'under_review', 'reviewed_at' => now(), 'reviewed_by_user_id' => $dto->actorId];
                    break;
                case 'resubmit':
                    if ($request->status !== Status::Returned) {
                        throw new \DomainException('Only returned requests can be resubmitted.');
                    }
                    $this->requests->assertReady($request, false);
                    $attributes = ['status' => 'pending'];
                    break;
                case 'return':
                case 'cancel':
                    if ($command === 'return' && $request->status === Status::Draft) {
                        throw new \DomainException('Complete the draft before returning it for correction.');
                    }
                    if (mb_strlen(trim($data['reason'] ?? '')) < 10) {
                        throw new \DomainException('Provide a reason of at least 10 characters.');
                    }
                    $this->allocations->cancel($request);
                    $stage = $command === 'return' ? 'returned' : 'cancelled';
                    $attributes = ['status' => $stage, $stage.'_at' => now(), $stage.'_by_user_id' => $dto->actorId,
                        'transition_reason' => trim($data['reason']), 'cooldown_exception_authorization' => null];
                    break;
                case 'approve':
                    if ($request->status !== Status::UnderReview || ! ($data['recipient_reviewed'] ?? false)) {
                        throw new \DomainException('Complete recipient review before approval.');
                    }
                    $this->requests->assertReady($request);
                    $context = $this->cooldowns->context($request, today()->toDateString());
                    $authorization = $this->cooldowns->authorize($request, $context, $data['cooldown_fingerprint'] ?? '', $data['cooldown_exception_reason'] ?? '', $dto->actorId);
                    foreach ($request->documentChecks()->where('is_active', true)->where('is_required', true)->get() as $check) {
                        if ($check->status !== 'verified' || ! $check->checked_at) {
                            throw new \DomainException('Inspect every required document before approval.');
                        }
                        if (in_array($check->evidence_mode, ['upload', 'both'], true)
                            && (! $check->current_media_id || $check->current_media_id !== $check->inspected_media_id
                            || ! $request->media()->whereKey($check->current_media_id)->exists())) {
                            throw new \DomainException('Required uploaded evidence has changed or is missing.');
                        }
                        if (in_array($check->evidence_mode, ['physical', 'both'], true)
                            && ! PhysicalCopyRequirement::from($check->physical_copy_requirement)->accepts(PhysicalCopyRequirement::tryFrom($check->presented_copy_type ?? ''))) {
                            throw new \DomainException('A required physical copy has not been inspected.');
                        }
                    }
                    $request->approval_revision++;
                    $this->allocations->reserve($request);
                    $attributes = ['status' => 'approved', 'approved_at' => now(), 'approved_by_user_id' => $dto->actorId,
                        'approval_revision' => $request->approval_revision, 'cooldown_exception_authorization' => $authorization];
                    break;
                case 'authorize_cooldown':
                    if ($request->status !== Status::Approved) {
                        throw new \DomainException('Cooldown exceptions can only be authorized for approved, unreleased requests.');
                    }
                    $this->requests->unchangedIdentity($request);
                    $date = $data['actual_release_on'];
                    if ($date > today()->toDateString() || $date < $request->approved_at->toDateString()) {
                        throw new \DomainException('Handover date must be between approval and today.');
                    }
                    $context = $this->cooldowns->context($request, $date);
                    if (! $context['blocked']) {
                        throw new \DomainException('No cooldown exception is needed for this handover date.');
                    }
                    $attributes = ['cooldown_exception_authorization' => $this->cooldowns->authorize($request, $context,
                        $data['cooldown_fingerprint'] ?? '', $data['cooldown_exception_reason'] ?? '', $dto->actorId)];
                    break;
                case 'release':
                    if ($request->status !== Status::Approved) {
                        throw new \DomainException('Approve this request before recording handover.');
                    }
                    $this->requests->unchangedIdentity($request);
                    $date = CarbonImmutable::parse($data['actual_release_on'])->toDateString();
                    if ($date > today()->toDateString() || $date < $request->approved_at->toDateString()) {
                        throw new \DomainException('Handover date must be between approval and today.');
                    }
                    $context = $this->cooldowns->context($request, $date);
                    if ($context['blocked'] && ! $this->cooldowns->covers($request, $context)) {
                        throw new \DomainException('An active goods cooldown requires a current decision-maker exception for this handover date.');
                    }
                    if (! ($data['identity_inspected'] ?? false) || ! ($data['acknowledgement_confirmed'] ?? false) || ! filled($data['acknowledgement_reference'] ?? null)) {
                        throw new \DomainException('Inspect identity and confirm the handover acknowledgement.');
                    }
                    $representative = ($data['collector_type'] ?? '') === 'representative';
                    if (! in_array($data['collector_type'] ?? '', ['recipient', 'representative'], true)) {
                        throw new \DomainException('Select who collected the goods.');
                    }
                    if ($representative && (! filled($data['collector_name'] ?? null) || ! filled($data['collector_relationship'] ?? null)
                        || ! filled($data['collector_id_type'] ?? null) || mb_strlen(trim($data['collector_id_last_four'] ?? '')) !== 4)) {
                        throw new \DomainException('Complete representative identity evidence.');
                    }
                    $this->allocations->release($request->load('lines'), $dto->actorId, $date, $data['confirmed_allocation_ids'] ?? []);
                    $attributes = ['status' => 'released', 'released_at' => now(), 'released_by_user_id' => $dto->actorId,
                        'actual_release_on' => $date, 'collector_type' => $data['collector_type'],
                        'collector_name' => $representative ? trim($data['collector_name']) : $request->reviewed_snapshot['subject']['name'],
                        'collector_relationship' => $representative ? trim($data['collector_relationship']) : null,
                        'collector_id_type' => $representative ? trim($data['collector_id_type']) : null,
                        'collector_id_last_four' => $representative ? trim($data['collector_id_last_four']) : null,
                        'identity_inspected_at' => now(), 'acknowledgement_confirmed' => true,
                        'acknowledgement_reference' => trim($data['acknowledgement_reference']), 'release_notes' => $data['notes'] ?? null,
                        'handover_snapshot' => $request->reviewed_snapshot, 'cooldown_policy' => $this->cooldowns->capture($request, $context)];
                    break;
            }
            $request->update([...$attributes, 'version' => $request->version + 1, 'operations' => [...($request->operations ?? []), $data['operation_key'] => $hash]]);
            $this->ledger->audit($request, $dto->actorId, $command === 'authorize_cooldown' ? 'Authorized goods cooldown exception' : ucfirst($command).' goods request', $before,
                ['status' => $request->status->value, 'version' => $request->version, 'reason' => $data['reason'] ?? null,
                    'allocations' => $request->allocations()->get()->toArray(), 'acknowledgement_reference' => $request->acknowledgement_reference,
                    'cooldown_policy' => $request->cooldown_policy, 'cooldown_exception_authorization' => $request->cooldown_exception_authorization]);

            return $request;
        });
    }
}
