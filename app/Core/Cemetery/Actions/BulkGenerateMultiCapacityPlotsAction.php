<?php

namespace App\Core\Cemetery\Actions;

use App\Core\Cemetery\Dto\PlotDto;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Models\Block;
use App\Core\Cemetery\Models\CemeterySite;
use App\Core\Cemetery\Models\Plot;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;

/**
 * Transaction-safe creation of plots — handles both shapes the admin can
 * register from the same form:
 *
 *   • Single-capacity (FR-1): one plot row, no children. Status starts
 *     AVAILABLE; interments attach directly to this row.
 *
 *   • Multi-capacity   (FR-2): one PARENT container row + N CHILD slot rows.
 *     The parent carries the user-set capacity and NULL status (a container is
 *     not bookable — MD §7 Workflow B). Children inherit `name`/`type`/`row`
 *     from the parent, get `level = 1..N`, `capacity = 1`, and start with
 *     `status = AVAILABLE`. `position` is NULL on auto-generated children —
 *     the admin edits per-slot post-create (BR-5 allows position changes).
 *
 * Atomicity (SR-2): the whole sequence runs inside one `DB::transaction`. If
 * any insert fails (e.g. composite-spatial-unique collision on the 7th slot),
 * the parent and every earlier child roll back together.
 *
 * Audit trail (REQ-4.2): rows are created via `Model::create()` rather than
 * `Plot::insert()` so each insert fires the Activitylog `creating` event and
 * produces an `activity_log` row tied to the actor. The N+1-insert cost for
 * N ≤ 50 (BR-9) inside one transaction is the correct trade against losing
 * the audit trail.
 *
 * UPPERCASE (SR-3): name/row/position are normalized at the DTO boundary
 * (`PlotDto::upper()`), so this Action never deals with mixed case.
 */
class BulkGenerateMultiCapacityPlotsAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {}

    /**
     * Returns the parent plot. For multi-capacity, `slots` is eager-loaded so
     * the caller can redirect to the parent-detail page without an extra query.
     */
    public function execute(PlotDto $dto): Plot
    {
        return DB::transaction(function () use ($dto) {
            CemeterySite::query()
                ->forMunicipality($dto->municipalId)
                ->where('status', 'active')
                ->lockForUpdate()
                ->findOrFail($dto->cemeterySiteId);

            $block = Block::query()
                ->with('section:id,municipal_id,cemetery_site_id')
                ->where('municipal_id', $dto->municipalId)
                ->whereHas('section', fn ($query) => $query
                    ->where('municipal_id', $dto->municipalId)
                    ->where('cemetery_site_id', $dto->cemeterySiteId)
                    ->where('status', 'active'))
                ->lockForUpdate()
                ->findOrFail($dto->blockId);

            $cemeterySiteId = $block->section->cemetery_site_id;

            // FR-1 — single-capacity path. No parent/child split.
            if ($dto->capacity === 1) {
                return $this->createSinglePlot($dto, $cemeterySiteId);
            }

            // FR-2 — multi-capacity path. Parent container + N child slots.
            $parent = $this->createParentContainer($dto, $cemeterySiteId);

            $this->generateChildSlots($parent, $dto, $cemeterySiteId);

            return $parent->fresh('slots');
        });
    }

    private function createSinglePlot(PlotDto $dto, string $cemeterySiteId): Plot
    {
        return Plot::create([
            'id' => $this->idGenerator->generate(),
            'municipal_id' => $dto->municipalId,
            'cemetery_site_id' => $cemeterySiteId,
            'block_id' => $dto->blockId,
            'parent_plot_id' => null,
            'name' => $dto->name,
            'type' => $dto->type,
            'status' => PlotStatus::AVAILABLE->value,
            'row' => $dto->row,
            'level' => null,
            'position' => $dto->position,
            'capacity' => 1,
        ]);
    }

    private function createParentContainer(PlotDto $dto, string $cemeterySiteId): Plot
    {
        return Plot::create([
            'id' => $this->idGenerator->generate(),
            'municipal_id' => $dto->municipalId,
            'cemetery_site_id' => $cemeterySiteId,
            'block_id' => $dto->blockId,
            'parent_plot_id' => null,
            'name' => $dto->name,
            'type' => $dto->type,
            // Container row carries NO status — it is not bookable (MD §7).
            'status' => null,
            'row' => $dto->row,
            'level' => null,
            'position' => null,
            'capacity' => $dto->capacity,
        ]);
    }

    private function generateChildSlots(Plot $parent, PlotDto $dto, string $cemeterySiteId): void
    {
        // BR-10 — level starts at 1 and increments by 1. The numeric `level`
        // is the canonical ordering field; admins can rename slots later if
        // they want custom labels ("Ground", "1F"), but level stays immutable.
        for ($level = 1; $level <= $dto->capacity; $level++) {
            Plot::create([
                'id' => $this->idGenerator->generate(),
                'municipal_id' => $dto->municipalId,
                'cemetery_site_id' => $cemeterySiteId,
                'block_id' => $dto->blockId,
                'parent_plot_id' => $parent->id,
                'name' => $dto->name, // inherited
                'type' => $dto->type, // inherited
                'status' => PlotStatus::AVAILABLE->value,
                'row' => $dto->row,  // inherited spatial locator
                'level' => $level,
                // Position is NULL by default. BR-5 lets the admin edit
                // per-slot position after generation (e.g. L/R/T/B).
                'position' => null,
                'capacity' => 1,
            ]);
        }
    }
}
