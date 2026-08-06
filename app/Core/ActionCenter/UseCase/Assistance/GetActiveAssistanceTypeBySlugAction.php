<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Models\AssistanceType;

class GetActiveAssistanceTypeBySlugAction
{
    public function execute(string $municipalId, string $slug): AssistanceType
    {
        return AssistanceType::query()
            ->with([
                'documents' => fn ($query) => $query
                    ->orderBy('ac_assistance_type_documents.sort_order'),
            ])
            ->where('municipal_id', $municipalId)
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();
    }
}
