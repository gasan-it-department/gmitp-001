<?php

namespace App\Core\Facility\Actions;

use App\Core\Facility\Dto\FacilityMutationDto;
use App\Core\Facility\Models\Facility;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

abstract class FacilityMutationAction
{
    protected function mutate(string $id, FacilityMutationDto $dto, callable $operation, ?callable $afterSave = null): Facility
    {
        return DB::transaction(function () use ($id, $dto, $operation, $afterSave) {
            $facility = Facility::query()->where('municipal_id', $dto->municipalId)->whereKey($id)->lockForUpdate()->firstOrFail();
            if ($facility->revision !== $dto->revision) {
                throw ValidationException::withMessages(['revision' => 'This facility changed while you were editing. Reload the page and review the latest information.']);
            }
            $operation($facility);
            $facility->revision++;
            $facility->save();
            if ($afterSave) {
                $afterSave($facility);
            }

            return $facility;
        });
    }

    protected function audit(Facility $facility, string $description, array $before, array $after): void
    {
        activity('facility')->performedOn($facility)->withProperties(['old' => $before, 'attributes' => $after])->log($description);
    }
}
