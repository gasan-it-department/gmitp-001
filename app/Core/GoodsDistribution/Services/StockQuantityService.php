<?php

namespace App\Core\GoodsDistribution\Services;

final class StockQuantityService
{
    public const MAX = 999999999999999;

    public function parse(string $value, string $unit = 'kg', bool $signed = false): int
    {
        $pattern = $signed ? '/^-?\d{1,12}(?:\.\d{1,3})?$/D' : '/^\d{1,12}(?:\.\d{1,3})?$/D';
        if (! preg_match($pattern, $value)) {
            throw new \DomainException('Enter a valid quantity with at most three decimal places.');
        }
        $negative = str_starts_with($value, '-');
        [$whole, $fraction] = array_pad(explode('.', ltrim($value, '-'), 2), 2, '');
        $amount = (int) $whole * 1000 + (int) str_pad($fraction, 3, '0');
        if (! in_array($unit, ['kg', 'piece'], true) || ($unit === 'piece' && $amount % 1000 !== 0)) {
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
        $packaged = ! empty($line['package_type']);
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
}
