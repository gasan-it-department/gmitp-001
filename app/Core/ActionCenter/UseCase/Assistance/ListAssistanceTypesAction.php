<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Models\AssistanceType;

class ListAssistanceTypesAction
{

    public function execute(string $municipalId)
    {
        return AssistanceType::where('municipal_id', $municipalId)
            ->where('is_active', true)
            ->get();
    }
}