<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Models\AssistanceType;

class GetAssistanceTypeAction
{
    public function __construct()
    {
    }

    public function execute(string $municipalId, string $typeId)
    {
        return AssistanceType::query()
            ->with('documents')
            ->where('municipal_id', $municipalId)
            ->findOrFail($typeId);
    }
}