<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Enums\AssistanceDisbursementStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Services\AssistanceDisbursementReferenceService;

class FindAssistanceDisbursementReferencesAction
{
    public function __construct(private readonly AssistanceDisbursementReferenceService $references) {}

    public function execute(string $requestId, string $municipalId, string $method, string $reference, int $page = 1): array
    {
        $request = AssistanceRequest::query()->where('municipal_id', $municipalId)->findOrFail($requestId);
        $editableId = $request->disbursements()
            ->where('municipal_id', $municipalId)
            ->where('status', AssistanceDisbursementStatus::Preparing->value)
            ->value('id');
        $query = $this->references->matches($municipalId, $method, trim($reference), $editableId)
            ->whereHas('assistanceRequest', fn ($query) => $query->where('municipal_id', $municipalId));

        return [
            'blocking' => $this->references->blocking(clone $query)->exists(),
            'matches' => $query->with('assistanceRequest:id,transaction_number,municipal_id')
                ->orderByRaw("CASE WHEN status = 'voided' THEN 1 ELSE 0 END")
                ->orderByDesc('created_at')->orderBy('id')
                ->paginate(10, ['*'], 'page', $page),
        ];
    }
}
