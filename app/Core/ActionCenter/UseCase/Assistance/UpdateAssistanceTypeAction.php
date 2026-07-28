<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\UpdateAssistanceTypeDto;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;

class UpdateAssistanceTypeAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
        private NormalizeAssistanceTypeDocumentSlotsAction $normalizeDocumentSlots,
    ) {
    }
    public function execute(UpdateAssistanceTypeDto $dto, string $typeId, string $municipalId)
    {
        return DB::transaction(function () use ($dto, $typeId, $municipalId) {
            $assistanceType = AssistanceType::query()
                ->where('municipal_id', $municipalId)
                ->findOrFail($typeId);

            $assistanceType->update([
                'name' => $dto->name,
                'description' => $dto->description,
                'min_amount' => $dto->minAmount,
                'max_amount' => $dto->maxAmount,
                'cooldown_months' => $dto->cooldownMonths,
                'is_active' => $dto->isActive,
            ]);

            $syncData = [];
            foreach ($this->normalizeDocumentSlots->execute($dto->documents, $municipalId) as $doc) {
                $syncData[$doc['id']] = [
                    'id' => $this->idGenerator->generate(),
                    'is_required' => $doc['is_required'],
                    'physical_copy_requirement' => $doc['physical_copy_requirement'],
                ];
            }

            $assistanceType->documents()->sync($syncData);

            return $assistanceType;
        });
    }
}
