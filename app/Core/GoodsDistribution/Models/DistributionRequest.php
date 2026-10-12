<?php

namespace App\Core\GoodsDistribution\Models;

use App\Core\GoodsDistribution\Enums\DistributionStatus;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

final class DistributionRequest extends GoodsModel implements HasMedia
{
    use InteractsWithMedia;

    protected $table = 'gd_distribution_requests';

    protected $casts = [
        'status' => DistributionStatus::class, 'filing_snapshot' => 'array', 'reviewed_snapshot' => 'array',
        'handover_snapshot' => 'array', 'operations' => 'array', 'acknowledgement_confirmed' => 'boolean',
        'version' => 'integer', 'approval_revision' => 'integer', 'actual_release_on' => 'date',
        'reviewed_at' => 'datetime', 'approved_at' => 'datetime', 'returned_at' => 'datetime',
        'cancelled_at' => 'datetime', 'released_at' => 'datetime', 'identity_inspected_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        self::updating(function (self $record): void {
            if (DistributionStatus::from($record->getRawOriginal('status'))->terminal()) {
                throw new \DomainException('Finalized goods requests are immutable.');
            }
        });
        self::deleting(fn () => throw new \DomainException('Goods requests are permanent history and cannot be deleted.'));
    }

    public function lines(): HasMany
    {
        return $this->hasMany(DistributionRequestLine::class)->where('is_active', true)->orderBy('sort_order');
    }

    public function allLines(): HasMany
    {
        return $this->hasMany(DistributionRequestLine::class);
    }

    public function documentChecks(): HasMany
    {
        return $this->hasMany(DistributionDocumentCheck::class)->orderBy('sort_order')->orderBy('id');
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(DistributionStockAllocation::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('goods_documents')->acceptsMimeTypes(['application/pdf', 'image/jpeg', 'image/png']);
    }
}
