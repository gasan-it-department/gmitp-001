<?php

namespace App\Core\GoodsDistribution\Services;

final class ItemIdentityService
{
    public function normalize(string $value): string
    {
        $value = mb_strtolower(\Normalizer::normalize($value, \Normalizer::FORM_KC), 'UTF-8');
        // Preserve decimals (including .5) and fractional sizes instead of collapsing them.
        $value = preg_replace('/\.(?!\p{N})|(?<!\p{N})\/|\/(?!\p{N})/u', ' ', $value);
        $value = preg_replace('/[^\p{L}\p{M}\p{N}.\/]+/u', ' ', $value);

        return trim(preg_replace('/\s+/u', ' ', $value));
    }

    public function matchType(string $name, string $unit, string $otherName, string $otherUnit): ?string
    {
        $name = $this->normalize($name);
        $otherName = $this->normalize($otherName);
        if ($name === '' || $otherName === '') {
            return null;
        }
        if ($name === $otherName && $this->normalize($unit) === $this->normalize($otherUnit)) {
            return 'exact';
        }
        $a = explode(' ', $name);
        $b = explode(' ', $otherName);

        return str_contains($name, $otherName) || str_contains($otherName, $name)
            || array_diff($a, $b) === [] || array_diff($b, $a) === [] ? 'possible' : null;
    }
}
