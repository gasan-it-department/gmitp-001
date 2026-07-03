<?php

namespace App\Core\Cemetery\Actions\Plots;

use App\Core\Cemetery\Dto\Plots\UpdatePlotDetailsDto;
use App\Core\Cemetery\Enums\PlotTypes;
use App\Core\Cemetery\Models\Plot;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdatePlotDetailsAction
{
    public function execute(UpdatePlotDetailsDto $dto): Plot
    {
        return DB::transaction(function () use ($dto) {
            $plot = Plot::query()
                ->where('municipal_id', $dto->municipalId)
                ->where('cemetery_site_id', $dto->cemeterySiteId)
                ->lockForUpdate()
                ->findOrFail($dto->plotId);

            $this->assertEditable($plot);
            $this->assertNameIsUnique($plot, $dto);

            $plot->forceFill([
                'name' => $dto->name,
                'type' => $dto->type,
                'area_sqm' => $dto->areaSqm,
            ])->save();

            return $plot;
        });
    }

    private function assertEditable(Plot $plot): void
    {
        if ($plot->type === PlotTypes::APARTMENT_NICHE || $plot->parent_plot_id !== null) {
            throw ValidationException::withMessages([
                'name' => 'Apartment niche labels are generated as a group and cannot be manually edited in V1.',
            ]);
        }
    }

    private function assertNameIsUnique(Plot $plot, UpdatePlotDetailsDto $dto): void
    {
        $exists = Plot::query()
            ->where('municipal_id', $dto->municipalId)
            ->where('block_id', $plot->block_id)
            ->where('parent_plot_id', $plot->parent_plot_id)
            ->where('name', $dto->name)
            ->whereKeyNot($plot->id)
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'name' => 'A plot with this name already exists in the same block.',
            ]);
        }
    }
}
