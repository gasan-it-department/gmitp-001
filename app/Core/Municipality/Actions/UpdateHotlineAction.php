<?php

namespace App\Core\Municipality\Actions;

use App\Core\Municipality\Dto\UpdateHotlineDto;
use App\Core\Municipality\Models\MunicipalityHotline;
use Illuminate\Support\Facades\DB;

class UpdateHotlineAction
{
    public function execute(string $id, UpdateHotlineDto $dto): MunicipalityHotline
    {
        return DB::transaction(function () use ($id, $dto) {
            $hotline = MunicipalityHotline::query()
                ->where('municipal_id', $dto->municipalId)
                ->whereKey($id)
                ->firstOrFail();

            $payload = array_filter([
                'name'       => $dto->name,
                'number'     => $dto->number,
                'category'   => $dto->category,
                'is_active'  => $dto->isActive,
                'sort_order' => $dto->sortOrder,
            ], fn ($v) => ! is_null($v));

            if (! empty($payload)) {
                $hotline->update($payload);
            }

            return $hotline->fresh();
        }, attempts: 3);
    }
}
