<?php

namespace App\Core\Cemetery\Actions\Plots;

use App\Core\Cemetery\Dto\Plots\UpdatePlotLeaseDto;
use App\Core\Cemetery\Enums\PlotLeaseStatus;
use App\Core\Cemetery\Models\Plot;
use App\Core\Cemetery\Models\PlotLease;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdatePlotLeaseAction
{
    public function execute(UpdatePlotLeaseDto $dto): PlotLease
    {
        return DB::transaction(function () use ($dto) {
            Plot::query()
                ->where('municipal_id', $dto->municipalId)
                ->where('cemetery_site_id', $dto->cemeterySiteId)
                ->lockForUpdate()
                ->findOrFail($dto->plotId);

            $lease = PlotLease::query()
                ->where('municipal_id', $dto->municipalId)
                ->where('plot_id', $dto->plotId)
                ->where('status', PlotLeaseStatus::ACTIVE->value)
                ->lockForUpdate()
                ->first();

            if (! $lease) {
                throw ValidationException::withMessages([
                    'leaseholder_name' => 'This plot does not have an active lease to update yet.',
                ]);
            }

            $lease->forceFill([
                'leaseholder_name' => $dto->leaseholderName,
                'leaseholder_contact' => $dto->leaseholderContact,
                'leaseholder_address' => $dto->leaseholderAddress,
                'leaseholder_relationship' => $dto->leaseholderRelationship,
                'lease_start' => $dto->leaseStart,
                'lease_end' => $dto->leaseEnd,
                'amount_paid' => $dto->amountPaid,
                'or_number' => $dto->orNumber,
                'notes' => $dto->notes,
            ])->save();

            return $lease;
        });
    }
}
