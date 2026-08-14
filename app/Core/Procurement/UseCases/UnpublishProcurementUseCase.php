<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Models\Procurement;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use Illuminate\Support\Facades\DB;

class UnpublishProcurementUseCase
{
    public function __construct(
        private ProcurementsRepository $procurementsRepository,
    ) {}

    public function execute(string $municipalId, string $procurementId, string $reason): Procurement
    {
        return DB::transaction(function () use ($municipalId, $procurementId, $reason) {
            $procurement = $this->procurementsRepository->lockByIdAndMunicipality(
                $procurementId,
                $municipalId,
            );

            if (! $procurement->isPublished()) {
                throw new ProcurementDomainException('This procurement is already private.');
            }

            $reason = trim($reason);
            if ($reason === '') {
                throw new ProcurementDomainException('A correction reason is required before unpublishing.');
            }

            $previousPublishedAt = $procurement->published_at?->toIso8601String();

            $procurement->update([
                'published_at' => null,
            ]);

            activity('procurement')
                ->performedOn($procurement)
                ->causedBy(auth()->user())
                ->withProperties([
                    'reason' => $reason,
                    'previous_published_at' => $previousPublishedAt,
                    'status' => $procurement->status->value,
                ])
                ->event('unpublished_for_correction')
                ->log('Procurement unpublished for correction');

            return $procurement;
        }, attempts: 3);
    }
}
