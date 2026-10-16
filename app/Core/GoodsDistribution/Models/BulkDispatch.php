<?php

namespace App\Core\GoodsDistribution\Models;

use App\Core\GoodsDistribution\Enums\BulkDispatchStatus;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

final class BulkDispatch extends GoodsModel implements HasMedia
{
    use InteractsWithMedia;

    protected $table = 'gd_bulk_dispatches';

    protected $casts = [
        'status' => BulkDispatchStatus::class, 'destination_barangays' => 'array', 'approval_snapshot' => 'array', 'operations' => 'array',
        'version' => 'integer', 'approval_revision' => 'integer', 'custodian_acknowledged' => 'boolean',
        'approved_at' => 'datetime', 'dispatched_at' => 'datetime', 'actual_dispatch_on' => 'date',
        'closed_at' => 'datetime', 'cancelled_at' => 'datetime', 'reopened_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        self::updating(function (self $record): void {
            $status = $record->getRawOriginal('status');
            if ($status === 'cancelled') {
                throw new \DomainException('Cancelled dispatches cannot be changed.');
            }
            if (in_array($status, ['dispatched', 'closed'], true) && $record->isDirty([
                'program_id', 'storage_location_id', 'requester_name', 'requester_role', 'custodian_type', 'custodian_user_id',
                'custodian_name', 'custodian_role', 'destination_barangays', 'location_notes', 'purpose', 'purpose_notes', 'paper_reference',
                'approval_snapshot', 'approved_at', 'approval_revision', 'actual_dispatch_on', 'dispatched_at',
            ])) {
                throw new \DomainException('Issued dispatch details are permanent. Correct reconciliation entries instead.');
            }
        });
        self::deleting(fn () => throw new \DomainException('Dispatch history cannot be deleted.'));
    }

    public function lines(): HasMany
    {
        return $this->hasMany(BulkDispatchLine::class)->where('is_active', true)->orderBy('sort_order');
    }

    public function allLines(): HasMany
    {
        return $this->hasMany(BulkDispatchLine::class);
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(BulkDispatchStockAllocation::class);
    }

    public function reconciliations(): HasMany
    {
        return $this->hasMany(BulkDispatchReconciliation::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('bulk_dispatch_evidence')->acceptsMimeTypes(['application/pdf', 'image/jpeg', 'image/png']);
    }
}
