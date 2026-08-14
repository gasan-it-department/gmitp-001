<?php

namespace App\Core\Procurement\UseCases;

use App\Core\Procurement\Enums\ProcurementStatus;
use App\Core\Procurement\Exceptions\ProcurementDomainException;
use App\Core\Procurement\Repositories\ProcurementsRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class EvaluateProcurementUseCase
{
    public function __construct(
        protected ProcurementsRepository $procurementsRepo,
    ) {}

    public function execute(string $municipalId, string $procurementId, ?string $remarks = null): void
    {
        DB::transaction(function () use ($municipalId, $procurementId, $remarks) {
            $procurement = $this->procurementsRepo->lockByIdAndMunicipality($procurementId, $municipalId);

            if ($procurement->isPublished()) {
                throw new ProcurementDomainException('Unpublish this procurement for correction before changing its lifecycle status.');
            }

            if (! $procurement->closing_date) {
                throw new ProcurementDomainException('The procurement has no official closing date.');
            }

            $closingDate = Carbon::parse($procurement->closing_date);
            if (now()->isBefore($closingDate)) {
                throw new ProcurementDomainException(
                    "Action Denied: You cannot evaluate this project before {$closingDate->format('M d, Y g:i A')}."
                );
            }

            $this->procurementsRepo->transitionStatus(
                $procurement,
                ProcurementStatus::OPEN,
                ProcurementStatus::EVALUATING,
            );

            activity('procurement')
                ->performedOn($procurement)
                ->causedBy(auth()->user())
                ->withProperties(['remarks' => filled($remarks) ? trim($remarks) : null])
                ->event('evaluation_started')
                ->log('Procurement moved to evaluation');
        }, attempts: 3);
    }
}
