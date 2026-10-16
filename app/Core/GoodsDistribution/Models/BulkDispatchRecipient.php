<?php

namespace App\Core\GoodsDistribution\Models;

use App\Core\GoodsDistribution\Enums\BulkRecipientAcknowledgement;
use App\Core\GoodsDistribution\Enums\BulkRecipientStatus;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class BulkDispatchRecipient extends GoodsModel
{
    protected $table = 'gd_bulk_dispatch_recipients';

    protected $appends = ['full_name'];

    protected $casts = ['status' => BulkRecipientStatus::class, 'acknowledgement' => BulkRecipientAcknowledgement::class,
        'received_on' => 'date', 'voided_at' => 'datetime', 'version' => 'integer'];

    protected static function booted(): void
    {
        self::updating(function (self $record): void {
            if ($record->getRawOriginal('status') === 'voided') {
                throw new \DomainException('Voided recipient entries are permanent.');
            }
        });
        self::deleting(fn () => throw new \DomainException('Void recipient entries instead of deleting history.'));
    }

    public function dispatch(): BelongsTo
    {
        return $this->belongsTo(BulkDispatch::class, 'bulk_dispatch_id');
    }

    public function getFullNameAttribute(): string
    {
        return implode(' ', array_filter([
            $this->first_name, $this->middle_name, $this->last_name, $this->suffix,
        ], fn ($part) => filled($part)));
    }

    public function lines(): HasMany
    {
        return $this->hasMany(BulkDispatchRecipientLine::class, 'recipient_id')->where('is_active', true)->orderBy('id');
    }

    public function allLines(): HasMany
    {
        return $this->hasMany(BulkDispatchRecipientLine::class, 'recipient_id');
    }
}
