<?php

namespace App\Core\GoodsDistribution\Models;

use App\Core\GoodsDistribution\Enums\BulkAdditionalIssueStatus;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class BulkDispatchAdditionalIssue extends GoodsModel
{
    protected $table = 'gd_bulk_dispatch_additional_issues';

    protected $casts = [
        'status' => BulkAdditionalIssueStatus::class, 'lines_snapshot' => 'array', 'approved_at' => 'datetime',
        'issued_at' => 'datetime', 'actual_issue_on' => 'date:Y-m-d', 'cancelled_at' => 'datetime', 'custodian_acknowledged' => 'boolean', 'approval_revision' => 'integer',
    ];

    protected static function booted(): void
    {
        self::updating(function (self $issue): void {
            if (in_array($issue->getRawOriginal('status'), ['issued', 'cancelled'], true)) {
                throw new \DomainException('Issued and cancelled additional issues are immutable.');
            }
        });
        self::deleting(fn () => throw new \DomainException('Additional issue history cannot be deleted.'));
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(BulkDispatchStockAllocation::class, 'additional_issue_id');
    }
}
