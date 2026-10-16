<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\ActionCenter\Enums\PhysicalCopyRequirement;
use App\Core\GoodsDistribution\Dto\DistributionRequestDto;
use App\Core\GoodsDistribution\Enums\DistributionStatus;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Services\DistributionRequestService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

final class ReviewDistributionDocumentAction
{
    public function __construct(private readonly DistributionRequestService $requests, private readonly StockLedgerService $ledger) {}

    public function execute(DistributionRequestDto $dto, string $checkId, ?UploadedFile $file = null): DistributionRequest
    {
        $this->requests->actor($dto->municipalId, $dto->actorId, $file ? (
            \App\Core\Users\Models\User::findOrFail($dto->actorId)->can('goods_distribution.requests.process')
                ? 'goods_distribution.requests.process' : 'goods_distribution.requests.intake'
        ) : 'goods_distribution.requests.process');
        $newMedia = null;
        try {
            return DB::transaction(function () use ($dto, $checkId, $file, &$newMedia) {
                $this->ledger->lockMunicipality($dto->municipalId);
                $request = $this->requests->locked($dto->municipalId, $dto->requestId);
                $this->requests->version($request, (int) $dto->data['version']);
                if (! in_array($request->status, [DistributionStatus::Draft, DistributionStatus::Pending, DistributionStatus::Returned, DistributionStatus::UnderReview], true)) {
                    throw new \DomainException('Return an approved request before changing its evidence.');
                }
                $check = $request->documentChecks()->where('municipal_id', $dto->municipalId)->whereKey($checkId)->firstOrFail();
                if (! $check->is_active) {
                    throw new \DomainException('This document requirement was removed from the active checklist.');
                }
                $before = $check->only(['status', 'current_media_id', 'inspected_media_id', 'presented_copy_type', 'remarks']);
                if ($file) {
                    $disk = config('goods_distribution.document_disk');
                    $diskConfig = config('filesystems.disks.'.$disk);
                    if (! is_array($diskConfig)) {
                        throw new \DomainException('Configure a valid media storage disk before uploading evidence.');
                    }
                    if ($check->evidence_mode === 'physical') {
                        throw new \DomainException('This requirement uses physical inspection only.');
                    }
                    $newMedia = $request->addMedia($file)->usingFileName((string) \Illuminate\Support\Str::ulid().'.'.$file->extension())
                        ->addCustomHeaders(['visibility' => $diskConfig['visibility'] ?? 'private'])
                        ->withCustomProperties(['document_check_id' => $check->id,
                            'goods_distribution_path_version' => 1])->toMediaCollection('goods_documents', $disk);
                    $check->update(['current_media_id' => $newMedia->id, 'status' => 'pending', 'inspected_media_id' => null, 'checked_at' => null, 'checked_by_user_id' => null, 'remarks' => null]);
                } else {
                    if ($request->status !== DistributionStatus::UnderReview) {
                        throw new \DomainException('Start review before inspecting documents.');
                    }
                    $status = $dto->data['status'];
                    if (! in_array($status, ['verified', 'rejected', 'pending'], true)) {
                        throw new \DomainException('Select a valid document inspection result.');
                    }
                    $presented = PhysicalCopyRequirement::tryFrom($dto->data['presented_copy_type'] ?? '');
                    if ($status === 'verified') {
                        if (in_array($check->evidence_mode, ['physical', 'both'], true) && (! $presented || ! PhysicalCopyRequirement::from($check->physical_copy_requirement)->accepts($presented))) {
                            throw new \DomainException('Inspect the required physical copy.');
                        }
                        if (in_array($check->evidence_mode, ['upload', 'both'], true) && (! $check->current_media_id || ! $request->media()->whereKey($check->current_media_id)->exists())) {
                            throw new \DomainException('Upload the required evidence before verifying it.');
                        }
                    }
                    $check->update(['status' => $status, 'presented_copy_type' => $presented?->value, 'remarks' => $dto->data['remarks'] ?? null,
                        'inspected_media_id' => $status === 'verified' ? $check->current_media_id : null,
                        'checked_at' => now(), 'checked_by_user_id' => $dto->actorId]);
                }
                $request->update(['version' => $request->version + 1]);
                $this->ledger->audit($request, $dto->actorId, $file ? 'Uploaded goods request evidence' : 'Inspected goods request document',
                    ['document' => $check->label, ...$before], ['document' => $check->label, ...$check->only(['status', 'current_media_id', 'inspected_media_id', 'presented_copy_type', 'remarks'])]);

                return $request;
            });
        } catch (\Throwable $exception) {
            if ($newMedia) {
                $newMedia->delete();
            }
            throw $exception;
        }
    }
}
