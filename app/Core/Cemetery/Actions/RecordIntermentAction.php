<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Actions\Decedents\GetIntermentReadinessAction;
use App\Core\Cemetery\Dto\IntermentDto;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Models\Decedent;
use App\Core\Cemetery\Models\Interment;
use App\Core\Cemetery\Models\IntermentReadinessOverride;
use App\Core\Cemetery\Models\Plot;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Bridge between Decedent and a Plot LEAF/SLOT — records ONE interment event
 * (initial or transfer) and atomically flips the slot to OCCUPIED.
 *
 * The Action enforces three hard invariants even when the Request layer has
 * already validated them. Concurrent admins can race for the same available
 * slot; only a DB-side guard wins that race.
 *
 *   BR-1  Only an AVAILABLE plot/slot can receive a new interment.
 *         RESERVED + MAINTENANCE are intentionally excluded.
 *
 *   BR-3  Upon recording, the slot status flips AVAILABLE → OCCUPIED in the
 *         same transaction. Failure of either step rolls back both.
 *
 *   BR-4  Interments may NEVER attach to a parent container row. Only a
 *         single-capacity plot (no children) or a child slot is assignable.
 *
 * Race handling (SR-2):
 *   • `lockForUpdate()` takes a pessimistic row lock on the plot, scoped by
 *     `municipal_id`. Two concurrent assignments to the same slot serialize.
 *   • The status flip uses `$plot->save()` (NOT a mass `update()`) so the
 *     Spatie Activitylog `updating` event fires and the AVAILABLE → OCCUPIED
 *     transition is captured in `activity_log` for audit (REQ-4.2).
 *
 * Tenancy: every read and write is scoped by `municipal_id` from the DTO,
 * itself sourced from `app('municipal_id')` (SR-1). A cross-tenant `plot_id`
 * 404s at the locked `findOrFail` before any mutation runs.
 */
class RecordIntermentAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
        private GetIntermentReadinessAction $getIntermentReadiness,
    ) {}

    public function execute(IntermentDto $dto): Interment
    {
        return DB::transaction(function () use ($dto) {
            // Pessimistic lock — race-safe even if two admins click "Assign"
            // on the same available slot at the same instant. Released on
            // commit/rollback. Tenant scope folded into the lookup.
            $plot = Plot::query()
                ->where('municipal_id', $dto->municipalId)
                ->lockForUpdate()
                ->findOrFail($dto->plotId);

            $this->assertAssignable($plot);

            $decedent = Decedent::query()
                ->where('municipal_id', $dto->municipalId)
                ->lockForUpdate()
                ->findOrFail($dto->decedentId);

            $this->assertDecedentHasNoActiveInterment($dto);

            $readiness = $this->getIntermentReadiness->execute($decedent);
            if (! $readiness['ready']) {
                $missing = $readiness['registration_verified']
                    ? implode(', ', $readiness['missing'])
                    : 'verified registration';

                throw new RuntimeException(
                    "Decedent {$decedent->id} is not ready for interment. Missing: {$missing}."
                );
            }

            $interment = Interment::create([
                'id' => $this->idGenerator->generate(),
                'municipal_id' => $dto->municipalId,
                'decedent_id' => $dto->decedentId,
                'plot_id' => $plot->id,
                'interment_date' => $dto->intermentDate,
                'type' => $dto->type,
                'notes' => $dto->notes,
            ]);

            // BR-3 — flip the locked slot to OCCUPIED. `save()` (not mass
            // update) is deliberate so the model `updating` event fires and
            // Activitylog captures the AVAILABLE → OCCUPIED transition.
            $plot->status = PlotStatus::OCCUPIED;
            $plot->save();

            if ($readiness['via_override']) {
                $override = IntermentReadinessOverride::query()
                    ->where('municipal_id', $dto->municipalId)
                    ->where('decedent_id', $decedent->id)
                    ->whereKey($readiness['override']['id'])
                    ->whereNull('consumed_at')
                    ->lockForUpdate()
                    ->firstOrFail();

                if (! $override->isUsable()) {
                    throw new RuntimeException('The readiness override expired or was already consumed.');
                }

                $override->forceFill([
                    'consumed_at' => now(),
                    'consumed_by' => auth()->id(),
                ])->save();
            }

            return $interment;
        });
    }

    /**
     * BR-1 + BR-4 — gatekeeper for "is this row even allowed to be interred
     * into?" Runs AFTER the pessimistic lock so the answer cannot drift.
     */
    private function assertAssignable(Plot $plot): void
    {
        // BR-4 — a parent container is never bookable directly. A "leaf" is
        // either a child slot (parent_plot_id set) OR a single-capacity plot
        // (capacity = 1, no children, parent_plot_id NULL). The shorthand
        // "container = no parent AND capacity > 1" catches it cheaply.
        $isContainer = $plot->parent_plot_id === null && $plot->capacity > 1;

        if ($isContainer) {
            throw new RuntimeException(
                "Plot {$plot->id} is a parent container; pick a child slot."
            );
        }

        // BR-1 — only AVAILABLE plots/slots accept new interments.
        if ($plot->status !== PlotStatus::AVAILABLE) {
            $current = $plot->status?->value ?? 'NULL';
            throw new RuntimeException(
                "Plot {$plot->id} is not AVAILABLE (current status: {$current})."
            );
        }
    }

    /**
     * BR-2 — a decedent can have AT MOST ONE active interment at a time. In
     * the new event-typed schema, "active" = "not soft-deleted" (exhumation
     * and transfer soft-delete the prior interment row).
     *
     * The Request enforces this for UX, but the Action keeps the invariant
     * honest under concurrency. A transfer flow soft-deletes the prior row
     * BEFORE calling this Action, so the check passes correctly.
     */
    private function assertDecedentHasNoActiveInterment(IntermentDto $dto): void
    {
        $hasActive = Interment::query()
            ->where('municipal_id', $dto->municipalId)
            ->where('decedent_id', $dto->decedentId)
            ->exists();

        if ($hasActive) {
            throw new RuntimeException(
                "Decedent {$dto->decedentId} already has an active interment."
            );
        }
    }
}
