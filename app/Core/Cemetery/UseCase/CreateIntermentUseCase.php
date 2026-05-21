<?php

namespace App\Core\Cemetery\UseCase;

use App\Core\Cemetery\Dto\IntermentDto;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Models\Interment;
use App\Core\Cemetery\Repositories\IntermentsRepository;
use App\Core\Cemetery\Repositories\PlotsRepository;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Assigns a registered decedent to an AVAILABLE plot (REQ-3.1) and atomically
 * flips the plot status to OCCUPIED (REQ-3.2).
 *
 * The atomic guarantee is the whole point of putting this in a use case rather
 * than a controller: insert + status update + future event log must all roll
 * back together if any step fails.
 */
class CreateIntermentUseCase
{
    public function __construct(
        private IntermentsRepository $intermentRepo,
        private PlotsRepository $plotRepo,
        private IdGeneratorInterface $idGenerator,
    ) {
    }

    public function execute(IntermentDto $dto): Interment
    {
        return DB::transaction(function () use ($dto) {
            $intermentId = $this->idGenerator->generate();

            $interment = $this->intermentRepo->create($dto, $intermentId);

            // Mirror the lifecycle on the plot. We only flip to OCCUPIED when
            // the interment itself lands as interred (not pending).
            if ($dto->status === 'interred') {
                $rowsAffected = $this->plotRepo->updateStatus(
                    $dto->municipalId,
                    $dto->plotId,
                    PlotStatus::OCCUPIED->value,
                );

                if ($rowsAffected !== 1) {
                    // Should never happen — request validation already guards
                    // tenancy and availability. Raising here forces a rollback
                    // and surfaces a 500 rather than silently leaving the plot
                    // in the wrong state.
                    throw new RuntimeException('Failed to update plot status during interment.');
                }
            }

            return $interment;
        });
    }
}
