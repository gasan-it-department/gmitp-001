<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Dto\IntermentDto;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Models\Interment;
use App\Core\Cemetery\Models\Plot;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Assigns a registered decedent to an AVAILABLE plot (REQ-3.1) and atomically
 * flips the plot status to OCCUPIED (REQ-3.2). Direct Eloquent — no repository.
 *
 * The atomic guarantee is the whole point of the transaction: insert + status
 * update must roll back together if any step fails.
 */
class StoreIntermentAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {
    }

    public function execute(IntermentDto $dto): Interment
    {
        return DB::transaction(function () use ($dto) {
            $interment = Interment::create([
                'id' => $this->idGenerator->generate(),
                'decedent_id' => $dto->decedentId,
                'plot_id' => $dto->plotId,
                'interment_date' => $dto->intermentDate,
                'status' => $dto->status,
            ]);

            // Mirror the lifecycle on the plot. We only flip to OCCUPIED when the
            // interment itself lands as interred (not pending).
            if ($dto->status === 'interred') {
                $rowsAffected = Plot::where('municipal_id', $dto->municipalId)
                    ->where('id', $dto->plotId)
                    ->update(['status' => PlotStatus::OCCUPIED->value]);

                if ($rowsAffected !== 1) {
                    // Should never happen — request validation already guards
                    // tenancy and availability. Raising here forces a rollback
                    // rather than silently leaving the plot in the wrong state.
                    throw new RuntimeException('Failed to update plot status during interment.');
                }
            }

            return $interment;
        });
    }
}
