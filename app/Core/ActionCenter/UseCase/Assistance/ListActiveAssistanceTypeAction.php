<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Models\AssistanceType;

class ListActiveAssistanceTypeAction
{
    public function execute(string $municipalId)
    {

        return AssistanceType::query()
            ->withCount('documents')          // populates `documents_count` for the list resource
            ->where('municipal_id', $municipalId)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

    }

}