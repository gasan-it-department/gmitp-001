<?php

namespace App\Core\ActionCenter\Contracts;

use App\Core\ActionCenter\Dto\Assistance\FinancialDocumentDefaults;

interface FinancialDocumentDefaultsProvider
{
    public function for(
        ?string $municipalCode,
        ?string $assistanceTypeSlug = null,
    ): FinancialDocumentDefaults;
}
