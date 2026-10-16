<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\GoodsDistribution\Models\BulkDispatch;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Models\StockReceipt;

final class DistributionReferenceService
{
    public function nextRequest(string $municipalId): string
    {
        return $this->next($municipalId, DistributionRequest::class, 'GD');
    }

    public function nextBulkDispatch(string $municipalId): string
    {
        return $this->next($municipalId, BulkDispatch::class, 'BD');
    }

    public function nextReceipt(string $municipalId): string
    {
        return $this->next($municipalId, StockReceipt::class, 'GR', 'receipt_number');
    }

    // Creation actions hold the municipality lock until the new record is saved.
    private function next(string $municipalId, string $model, string $prefix, string $column = 'reference'): string
    {
        $prefix .= '-'.now()->format('Y');
        $highest = 0;
        foreach ($model::query()->withoutGlobalScope('municipality')->where('municipal_id', $municipalId)
            ->where($column, 'like', $prefix.'-%')->select($column)->cursor() as $record) {
            if (preg_match('/^'.$prefix.'-([0-9]{6,})$/D', $record->{$column}, $matches)) {
                $highest = max($highest, (int) $matches[1]);
            }
        }
        if ($highest === PHP_INT_MAX) {
            throw new \DomainException('The goods reference sequence has reached its limit.');
        }

        return $prefix.'-'.str_pad((string) ($highest + 1), 6, '0', STR_PAD_LEFT);
    }
}
