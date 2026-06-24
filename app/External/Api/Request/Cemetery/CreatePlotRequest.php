<?php

namespace App\External\Api\Request\Cemetery;

use App\Core\Cemetery\Enums\PlotTypes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

/**
 * Validates a NEW plot registration — single-capacity OR multi-capacity (the
 * BulkGenerateMultiCapacityPlotsAction handles both based on `capacity`).
 *
 * Tenant boundary: `municipal_id` is NEVER read from the payload — it is sourced
 * from `app('municipal_id')` (bound by SetMunicipalityContext middleware). The
 * existence check on `block_id` is scoped by the same id so a forged block_id
 * from another tenant fails closed.
 *
 * Initial status is NOT accepted from the payload: the Action chooses it
 *  (parent = NULL, slots / single = AVAILABLE) per MD §7. Admins change status
 *  later through dedicated maintenance/reservation flows.
 */
class CreatePlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Route already enforces auth + admin + municipalityContext middleware.
        return true;
    }

    public function rules(): array
    {
        $municipalId = app('municipal_id');
        $cemeterySiteId = $this->route('cemetery_site_id');
        $blockId = $this->input('block_id');

        return [
            'block_id' => [
                'required',
                'ulid',
                // The block must exist, belong to this tenant, and not be
                // soft-deleted — a forged or stale id fails closed here.
                Rule::exists('cemetery_blocks', 'id')
                    ->where(fn ($query) => $query
                        ->where('municipal_id', $municipalId)
                        ->whereIn(
                            'section_id',
                            DB::table('cemetery_sections')
                                ->select('id')
                                ->where('municipal_id', $municipalId)
                                ->where('cemetery_site_id', $cemeterySiteId)
                                ->where('status', 'active')
                                ->whereNull('deleted_at')
                        )
                        ->whereNull('deleted_at')),
            ],

            // Identifier carrying the plot/container name (e.g. "APARTMENT A-12").
            // UPPERCASE happens at the DTO; we only validate shape here.
            'name' => [
                'required',
                'string',
                'max:150',
                // Catch the obvious collision early: a parent/single plot with
                // this name already exists in the same block. The DB composite
                // unique still backs us up for cross-row edge cases.
                Rule::unique('cemetery_plots', 'name')
                    ->where(fn ($query) => $query
                        ->where('municipal_id', $municipalId)
                        ->where('block_id', $blockId)
                        ->whereNull('parent_plot_id')
                        ->whereNull('deleted_at')),
            ],

            'type' => ['required', new Enum(PlotTypes::class)],

            // BR-9 — capacity bounds. 1 = single-capacity plot (FR-1);
            // 2..50 = multi-capacity parent + that many child slots (FR-2).
            'capacity' => ['required', 'integer', 'min:1', 'max:50'],

            // Spatial locators. For multi-capacity, `row` is inherited by all
            // children; `position` is intra-level and stays NULL on auto-
            // generated children (admin edits per slot per BR-5).
            'row' => ['nullable', 'string', 'max:50'],
            'position' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'block_id.exists' => 'The selected block is not part of this active cemetery site.',
            'name.unique' => 'A plot with this name already exists in the selected block.',
            'capacity.min' => 'Capacity must be at least 1.',
            'capacity.max' => 'Capacity may not exceed 50 — anything larger is almost certainly a data-entry error.',
        ];
    }
}
