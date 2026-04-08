<?php

namespace App\Core\Procurement\Services;

class ProcurementDocumentService
{

    private const MAX_LIMIT = 15;

    public function isWithinLimit(int $count): bool
    {
        return $count < self::MAX_LIMIT;
    }

}