<?php

namespace App\Core\GoodsDistribution\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

final class BulkDispatchReconciliation extends GoodsModel
{
    protected $table = 'gd_bulk_dispatch_reconciliations';

    public const UPDATED_AT = null;

    protected $casts = ['occurred_on' => 'date', 'posted_at' => 'datetime', 'usable_confirmed' => 'boolean'];

    protected static function booted(): void
    {
        self::updating(fn () => throw new \DomainException('Reconciliation entries cannot be overwritten.'));
        self::deleting(fn () => throw new \DomainException('Reconciliation entries cannot be deleted.'));
    }

    public function lines(): HasMany
    {
        return $this->hasMany(BulkDispatchReconciliationLine::class, 'reconciliation_id');
    }

    public function reversedEntry(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reverses_reconciliation_id');
    }

    public function reversal(): HasOne
    {
        return $this->hasOne(self::class, 'reverses_reconciliation_id');
    }
}
