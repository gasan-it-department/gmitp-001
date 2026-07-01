<?php

namespace App\Core\Cemetery\Actions\Plots;

use App\Core\Cemetery\Dto\Plots\UpdatePlotLeaseDto;
use App\Core\Cemetery\Enums\PlotLeaseStatus;
use App\Core\Cemetery\Models\Plot;
use App\Core\Cemetery\Models\PlotLease;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StorePlotLeaseAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {}

    public function execute(UpdatePlotLeaseDto $dto): PlotLease
    {
        return DB::transaction(function () use ($dto) {
            $plot = Plot::query()
                ->where('municipal_id', $dto->municipalId)
                ->where('cemetery_site_id', $dto->cemeterySiteId)
                ->lockForUpdate()
                ->findOrFail($dto->plotId);

            $hasActiveLease = PlotLease::query()
                ->where('municipal_id', $dto->municipalId)
                ->where('plot_id', $plot->id)
                ->where('status', PlotLeaseStatus::ACTIVE->value)
                ->lockForUpdate()
                ->exists();

            if ($hasActiveLease) {
                throw ValidationException::withMessages([
                    'leaseholder_name' => 'This plot already has an active lease. Edit the existing lease instead.',
                ]);
            }

            return PlotLease::create([
                'id' => $this->idGenerator->generate(),
                'municipal_id' => $dto->municipalId,
                'created_from_interment_id' => null,
                'plot_id' => $plot->id,
                'leaseholder_name' => $dto->leaseholderName,
                'leaseholder_contact' => $dto->leaseholderContact,
                'leaseholder_address' => $dto->leaseholderAddress,
                'leaseholder_relationship' => $dto->leaseholderRelationship,
                'lease_start' => $dto->leaseStart,
                'lease_end' => $dto->leaseEnd,
                'amount_paid' => $dto->amountPaid,
                'or_number' => $dto->orNumber,
                'status' => PlotLeaseStatus::ACTIVE,
                'notes' => $dto->notes,
            ]);
        });
    }
}
