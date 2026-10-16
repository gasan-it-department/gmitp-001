<?php

namespace App\Core\GoodsDistribution\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class DistributionCooldown extends GoodsModel
{
    protected $table = 'gd_distribution_cooldowns';

    public $timestamps = false;

    protected $casts = ['starts_on' => 'date', 'ends_on' => 'date', 'duration' => 'integer', 'created_at' => 'datetime'];

    protected static function booted(): void
    {
        self::updating(fn () => throw new \DomainException('Recorded goods cooldowns cannot be changed.'));
        self::deleting(fn () => throw new \DomainException('Recorded goods cooldowns cannot be deleted.'));
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(DistributionRequest::class, 'distribution_request_id');
    }
}
