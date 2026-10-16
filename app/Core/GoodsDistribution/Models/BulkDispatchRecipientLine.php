<?php

namespace App\Core\GoodsDistribution\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class BulkDispatchRecipientLine extends GoodsModel
{
    protected $table = 'gd_bulk_dispatch_recipient_lines';

    protected $casts = ['quantity' => 'decimal:3', 'is_active' => 'boolean', 'revision' => 'integer'];

    protected static function booted(): void
    {
        self::updating(function (self $line): void {
            if ($line->isDirty(['municipal_id', 'bulk_dispatch_id', 'recipient_id', 'bulk_dispatch_line_id', 'item_id', 'item_name_snapshot', 'item_code_snapshot', 'base_unit', 'quantity', 'revision'])) {
                throw new \DomainException('Retain the original goods line and append its correction.');
            }
        });
        self::deleting(fn () => throw new \DomainException('Recipient goods history cannot be deleted.'));
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(BulkDispatchRecipient::class, 'recipient_id');
    }
}
