<?php

namespace App\Core\ActionCenter\Contracts;

use App\Core\ActionCenter\Dto\Assistance\AssistanceRequestFormDefinition;

interface AssistanceRequestFormDefinitionProvider
{
    public function for(
        ?string $municipalCode,
        ?string $assistanceTypeSlug,
    ): AssistanceRequestFormDefinition;
}
