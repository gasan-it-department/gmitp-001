<?php

namespace App\Core\ActionCenter\Contracts;

use App\Core\ActionCenter\Dto\Assistance\AcknowledgementReceiptWording;

interface AcknowledgementReceiptWordingProvider
{
    public function for(
        ?string $municipalCode,
        ?string $assistanceTypeSlug,
    ): AcknowledgementReceiptWording;
}
