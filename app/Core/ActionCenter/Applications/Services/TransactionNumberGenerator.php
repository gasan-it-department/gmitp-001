<?php

namespace App\Core\ActionCenter\Applications\Services;

use Illuminate\Support\Str;

class TransactionNumberGenerator
{
    public function generate(): string
    {
        $rnd = strtoupper(Str::random(4));
        $milliseconds = round(microtime(true) * 1000);
        $cutTime = substr($milliseconds, -6);
        return "{$rnd}-{$cutTime}";
    }
}