<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\GoodsDistribution\Enums\StockUnit;

final class StockQuantityService
{
    public const MAX = 999999999999999;

    public function parse(string $value, string $unit = 'kg', bool $signed = false): int
    {
        $stockUnit = StockUnit::tryFrom($unit);
        if ($stockUnit === null) {
            throw new \DomainException('Select a valid stock unit: kg or piece.');
        }
        $pattern = $signed ? '/^-?\d{1,12}(?:\.\d{1,3})?$/D' : '/^\d{1,12}(?:\.\d{1,3})?$/D';
        if (! preg_match($pattern, $value)) {
            throw new \DomainException('Enter a valid quantity with at most three decimal places.');
        }
        $negative = str_starts_with($value, '-');
        [$whole, $fraction] = array_pad(explode('.', ltrim($value, '-'), 2), 2, '');
        $amount = (int) $whole * 1000 + (int) str_pad($fraction, 3, '0');
        if ($stockUnit === StockUnit::Piece && $amount % 1000 !== 0) {
            throw new \DomainException('Counted items require a whole number of pieces.');
        }

        return $negative ? -$amount : $amount;
    }

    public function format(int $amount): string
    {
        $absolute = abs($amount);

        return ($amount < 0 ? '-' : '').intdiv($absolute, 1000).'.'.str_pad((string) ($absolute % 1000), 3, '0', STR_PAD_LEFT);
    }

    public function received(array $line, string $unit): string
    {
        $packageType = $line['package_type'] ?? null;
        $packaged = $packageType !== null;
        if ($packaged && (! is_string($packageType) || trim($packageType) === '')) {
            throw new \DomainException('Packaging details must include a nonblank package type.');
        }
        if ($packaged) {
            $count = filter_var($line['package_count'] ?? null, FILTER_VALIDATE_INT);
            $perPackage = $this->parse((string) ($line['quantity_per_package'] ?? ''), $unit);
            if ($count === false || $count < 1 || $perPackage < 1 || $count > intdiv(self::MAX, $perPackage)) {
                throw new \DomainException('Enter a positive package count and a valid quantity per package.');
            }
            $quantity = $count * $perPackage;
        } else {
            if (isset($line['package_count']) || isset($line['quantity_per_package'])) {
                throw new \DomainException('Packaging details must include a package type.');
            }
            $quantity = $this->parse((string) ($line['quantity'] ?? ''), $unit);
        }
        if ($quantity < 1) {
            throw new \DomainException('Received quantities must be greater than zero.');
        }

        return $this->format($quantity);
    }

    public function assertReceiptLine(array $line, string $unit): void
    {
        $lineNumber = filter_var($line['line_number'] ?? null, FILTER_VALIDATE_INT);
        if ($lineNumber === false || $lineNumber < 1) {
            throw new \DomainException('Stock receipt line numbers must be positive integers.');
        }
        $quantity = $this->parse((string) ($line['quantity'] ?? ''), $unit);
        if ($quantity < 1) {
            throw new \DomainException('Received quantities must be greater than zero.');
        }
        if ($this->received($line, $unit) !== $this->format($quantity)) {
            throw new \DomainException('The saved packaging and received quantity do not agree.');
        }
    }
}
