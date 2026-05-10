<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\StoreAssistanceTypeDto;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;

class StoreAssistanceTypeAction
{
    public function __construct(
        protected IdGeneratorInterface $idGeneratorInterface
    ) {
    }
    public function execute(StoreAssistanceTypeDto $dto, string $municipalId)
    {
        return DB::transaction(function () use ($dto, $municipalId) {
            $assistanceType = AssistanceType::create([
                'municipal_id' => $municipalId,
                'name' => $dto->name,
                'max_amount' => $dto->maxAmount,
                'cooldown_months' => $dto->cooldownMonths,
                'description' => $dto->description,
                'is_active' => $dto->isActive,
            ]);

            if (!empty($dto->documents)) {
                $syncData = [];

                foreach ($dto->documents as $doc) {
                    $syncData[$doc['id']] = ['id' => $this->idGeneratorInterface->generate(), 'is_required' => $doc['is_required']];
                }
                $assistanceType->documents()->sync($syncData);
            }

            return $assistanceType;
        });
    }
}