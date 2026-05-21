<?php

namespace App\Core\Cemetery\Repositories;

use App\Core\Cemetery\Dto\IntermentDto;
use App\Core\Cemetery\Models\Interment;

/**
 * Persistence boundary for cemetery_interments. The interment row is the join
 * between a decedent and a plot, with its own lifecycle status column.
 */
class IntermentsRepository
{
    public function create(IntermentDto $dto, string $intermentId): Interment
    {
        return Interment::create([
            'id' => $intermentId,
            'decedent_id' => $dto->decedentId,
            'plot_id' => $dto->plotId,
            'interment_date' => $dto->intermentDate,
            'status' => $dto->status,
        ]);
    }
}
