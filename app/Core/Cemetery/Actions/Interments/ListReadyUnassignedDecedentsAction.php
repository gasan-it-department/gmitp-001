<?php

namespace App\Core\Cemetery\Actions\Interments;

use App\Core\Cemetery\Actions\Decedents\GetIntermentReadinessAction;
use App\Core\Cemetery\Enums\IntermentEndType;
use App\Core\Cemetery\Enums\RegistrationStatus;
use App\Core\Cemetery\Models\Decedent;
use Illuminate\Support\Collection;

class ListReadyUnassignedDecedentsAction
{
    public function __construct(
        private GetIntermentReadinessAction $getIntermentReadiness,
    ) {}

    /**
     * @return Collection<int, Decedent>
     */
    public function execute(string $municipalId): Collection
    {
        return Decedent::query()
            ->with(['documents', 'unidentifiedDetail'])
            ->where('municipal_id', $municipalId)
            ->where('registration_status', RegistrationStatus::VERIFIED->value)
            ->whereDoesntHave('interments', fn ($query) => $query->active())
            ->whereDoesntHave('interments', fn ($query) => $query
                ->whereIn('end_type', [
                    IntermentEndType::EXHUMED->value,
                    IntermentEndType::TRANSFERRED_OUT->value,
                ]))
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(function (Decedent $decedent): Decedent {
                $decedent->setRelation('intermentReadiness', $this->getIntermentReadiness->execute($decedent));

                return $decedent;
            })
            ->values();
    }
}
