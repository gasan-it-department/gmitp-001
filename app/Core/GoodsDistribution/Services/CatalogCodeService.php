<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\GoodsDistribution\Enums\CatalogKind;

final class CatalogCodeService
{
    // The caller holds the municipality lock until the catalog record is saved.
    public function next(string $municipalId, CatalogKind $kind): string
    {
        $prefix = $kind->codePrefix();
        $model = $kind->model();
        $highest = 0;
        foreach ($model::query()->where('municipal_id', $municipalId)->where('code', 'like', $prefix.'-%')->select('code')->cursor() as $record) {
            if (preg_match('/^'.$prefix.'-([0-9]{6,})$/D', $record->code, $matches)) {
                $highest = max($highest, (int) $matches[1]);
            }
        }
        if ($highest === PHP_INT_MAX) {
            throw new \DomainException('The catalog code sequence has reached its limit.');
        }

        return $prefix.'-'.str_pad((string) ($highest + 1), 6, '0', STR_PAD_LEFT);
    }
}
