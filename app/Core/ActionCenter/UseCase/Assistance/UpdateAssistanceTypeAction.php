<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\UpdateAssistanceTypeDto;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;

class UpdateAssistanceTypeAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator
    ) {
    }
    public function execute(UpdateAssistanceTypeDto $dto, string $typeId)
    {
        return DB::transaction(function () use ($dto, $typeId) {
            $assistanceType = AssistanceType::findOrFail($typeId);

            $assistanceType->update([
                'name' => $dto->name,
                'description' => $dto->description,
                'max_amount' => $dto->maxAmount,
                'cooldown_months' => $dto->cooldownMonths,
                'is_active' => $dto->isActive,
            ]);

            $syncData = [];
            foreach ($dto->documents as $doc) {
                $syncData[$doc['id']] = ['id' => $this->idGenerator->generate(), 'is_required' => $doc['is_required']];
            }

            $assistanceType->documents()->sync($syncData);

            return $assistanceType;
        });
    }
}