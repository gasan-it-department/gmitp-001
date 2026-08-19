<?php

namespace App\Core\ActionCenter\Services;

use InvalidArgumentException;
use NumberFormatter;
use RuntimeException;

class PhilippinePesoInWordsFormatter
{
    public function format(float $amount): string
    {
        if ($amount < 0) {
            throw new InvalidArgumentException('The amount cannot be negative.');
        }

        $totalCentavos = (int) round($amount * 100, 0, PHP_ROUND_HALF_UP);
        $pesos = intdiv($totalCentavos, 100);
        $centavos = $totalCentavos % 100;
        $formatter = new NumberFormatter('en', NumberFormatter::SPELLOUT);
        $pesoWords = $formatter->format($pesos);

        if ($pesoWords === false) {
            throw new RuntimeException('The approved amount could not be converted to words.');
        }

        $result = strtoupper($pesoWords).' PESOS';

        if ($centavos > 0) {
            $result .= sprintf(' AND %02d/100', $centavos);
        }

        return $result.' ONLY';
    }
}
