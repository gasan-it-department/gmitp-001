<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\StoreAssistanceTypeDto;
use App\Core\ActionCenter\Exceptions\AssistanceTypeException;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StoreAssistanceTypeAction
{
    public function __construct(
        protected IdGeneratorInterface $idGeneratorInterface,
        private NormalizeAssistanceTypeDocumentSlotsAction $normalizeDocumentSlots,
    ) {
    }
    public function execute(StoreAssistanceTypeDto $dto, string $municipalId)
    {
        return DB::transaction(function () use ($dto, $municipalId) {
            $slug = Str::slug($dto->name);

            if ($slug === '') {
                throw AssistanceTypeException::invalidSlug();
            }

            $slugExists = AssistanceType::withTrashed()
                ->where('municipal_id', $municipalId)
                ->where('slug', $slug)
                ->exists();

            if ($slugExists) {
                throw AssistanceTypeException::duplicateSlug($dto->name);
            }

            try {
                $assistanceType = AssistanceType::create([
                    'municipal_id' => $municipalId,
                    'name' => $dto->name,
                    'slug' => $slug,
                    'min_amount' => $dto->minAmount,
                    'max_amount' => $dto->maxAmount,
                    'cooldown_months' => $dto->cooldownMonths,
                    'description' => $dto->description,
                    'is_active' => $dto->isActive,
                ]);
            } catch (QueryException $exception) {
                if ($this->isSlugUniqueViolation($exception)) {
                    throw AssistanceTypeException::duplicateSlug($dto->name);
                }

                throw $exception;
            }

            $documents = $this->normalizeDocumentSlots->execute($dto->documents, $municipalId);

            if (!empty($documents)) {
                $syncData = [];

                foreach ($documents as $doc) {
                    $syncData[$doc['id']] = [
                        'id' => $this->idGeneratorInterface->generate(),
                        'is_required' => $doc['is_required'],
                        'physical_copy_requirement' => $doc['physical_copy_requirement'],
                    ];
                }
                $assistanceType->documents()->sync($syncData);
            }

            return $assistanceType;
        });
    }

    private function isSlugUniqueViolation(QueryException $exception): bool
    {
        $sqlState = (string) $exception->getCode();

        if (!in_array($sqlState, ['23000', '23505'], true)) {
            return false;
        }

        $message = strtolower($exception->getMessage());

        return str_contains($message, 'ac_assistance_types_municipal_id_slug_unique')
            || (
                str_contains($message, 'ac_assistance_types.municipal_id')
                && str_contains($message, 'ac_assistance_types.slug')
            );
    }
}
