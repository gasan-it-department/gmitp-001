<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Dto\BulkDispatchDto;
use App\Core\GoodsDistribution\Models\BulkDispatch;
use App\Core\GoodsDistribution\Services\BulkDispatchService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class UploadBulkDispatchEvidenceAction
{
    public function __construct(private readonly BulkDispatchService $bulk, private readonly StockLedgerService $ledger) {}

    public function execute(BulkDispatchDto $dto, UploadedFile $file): BulkDispatch
    {
        $media = null;
        try {
            return DB::transaction(function () use ($dto, $file, &$media) {
                $this->ledger->lockMunicipality($dto->municipalId);
                $dispatch = $this->bulk->record($dto->municipalId, $dto->dispatchId, true);
                $this->bulk->actor($dto->municipalId, $dto->actorId, in_array($dispatch->status->value, ['draft', 'approved'], true) ? 'prepare' : 'reconcile');
                $data = [...$dto->data, 'file_hash' => hash_file('sha256', $file->getRealPath())];
                if ($this->bulk->operation($dispatch, $dto->actorId, 'attachment', $data)) {
                    return $dispatch;
                }
                $this->bulk->version($dispatch, (int) ($data['version'] ?? 0));
                if ($dispatch->status->value === 'cancelled') {
                    throw new \DomainException('Cancelled dispatches cannot receive attachments.');
                }
                if (! in_array($file->getMimeType(), ['application/pdf', 'image/jpeg', 'image/png'], true) || $file->getSize() > 10240 * 1024) {
                    throw new \DomainException('Upload a PDF, JPEG or PNG no larger than 10 MB.');
                }
                $disk = config('goods_distribution.document_disk');
                $config = config('filesystems.disks.'.$disk);
                if (! is_array($config)) {
                    throw new \DomainException('Configure a valid media storage disk.');
                }
                $media = $dispatch->addMedia($file)->usingFileName((string) Str::ulid().'.'.$file->extension())
                    ->withCustomProperties(['goods_distribution_path_version' => 1])
                    ->addCustomHeaders(['visibility' => $config['visibility'] ?? 'private'])->toMediaCollection('bulk_dispatch_evidence', $disk);
                $this->bulk->completeOperation($dispatch, $dto->actorId, 'attachment', $data);
                $this->ledger->audit($dispatch, $dto->actorId, 'Attached bulk dispatch evidence', [], ['media_id' => $media->id, 'mime_type' => $media->mime_type]);

                return $dispatch;
            });
        } catch (\Throwable $exception) {
            $media?->delete();
            throw $exception;
        }
    }
}
